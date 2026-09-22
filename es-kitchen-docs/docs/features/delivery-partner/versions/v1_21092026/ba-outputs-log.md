# BA Outputs Log — delivery-partner · v1 (21/09/2026)

> Snapshot lần chạy đầu tiên. Nguồn: Figma `ES-Kitchen-phase-2` canvas `Delivery (P2)` node `26173:304942`.

## Trạng thái 5 outputs

| # | Output | Status | Path / URL | Note |
|---|---|---|---|---|
| 0 | SPEC.md | ✅ Done | `../../SPEC.md` | 15 sections · 19 màn chính · 85 màn tổng · 55 AC · 28 RQ · 18 OQ |
| 1 | Figma — Flow Tổng Quan | ⏳ Chờ approve gate | Page `Feature - Flow` node `31403:200061` | Strict Mode (SCOPE_TYPE=[B]) — chờ user duyệt bảng Screens trước khi vẽ |
| 2 | Figma — Screen Flow | ⏳ Chờ Output 1 | Same page | Sequential Rule |
| 3 | Figma — Screens + Items | ⏳ Chờ Output 2 | Same page | Sequential Rule |
| 4 | HTML Prototype | ⏳ Chờ approve gate | `../../prototype/index.html` | — |

## Quyết định chốt trong lần chạy này

| # | Hạng mục | Giá trị | Nguồn |
|---|---|---|---|
| 1 | Path SPEC | `features/delivery-partner/SPEC.md` | User turn 2 |
| 2 | Scope | 8 flow chính thức, loại 5 frame nháp (`quote-request-*`, `weekly-schedule`, `empty-form`) | User turn 2 |
| 3 | Self-registration | Có — trạng thái `仮登録` chờ E03 duyệt | User turn 2 (giải C1) |
| 4 | Figma output page | `Feature - Flow` node `31403:200061` | User turn 2 |
| 5 | Hệ Screen Code | `OW_<FEAT4>_<Seq3>` — đồng bộ với Design-Technical.md + 43 task file | BA đề xuất (OQ-01 chờ PM chốt) |
| 6 | Platform | Website desktop 1440×1024 | Verify từ width frame Figma |

## Phát hiện mới so với `Figma-Analysis.md` (Tech Lead, 18/09/2026)

Bản phân tích cũ chỉ đọc **frame giao diện**, bỏ sót **24 node `Table`** đặt cạnh các màn — đó là bộ **画面設計書 song ngữ JP/VN** (項目名 · 必須 · 入力形式 · MIN/MAX · 表示条件 · 編集可否 · 詳細 · トリガー · バリデーション · 検証タイミング · エラーメッセージ).

SPEC v1 đã trích xuất **22/24 bảng** (2 bảng còn lại là bản JP trùng lặp) → đây là nguồn của toàn bộ `## Screen Details`, thay cho suy đoán.

Hệ quả: bổ sung được những thứ bản cũ không có —
- Toàn bộ validation rule + error message **nguyên văn** (55 AC trace được về bảng nguồn)
- Công thức tính: `差異 = 理論在庫 − 実在庫` · `誤差 = 予定数 − 実際数`
- Rule tự điền địa chỉ từ 郵便番号 và hành vi khi mã không tồn tại (không báo lỗi, giữ giá trị)
- Rule cây 対応エリア 3 tầng + indeterminate + đồng bộ 2 chiều với tag
- Giới hạn tài liệu 非公開: 20 file · JPG/JPEG/PNG · ≤5MB
- Quy tắc tên file CSV 集金 + 7 cột chi tiết
- Rule phát hành tài khoản hàng loạt: chỉ `有効`, popup 2 trạng thái, nút `再度実行`

## Open Questions mở (18)

OQ-01 Screen Code · OQ-02 rule khóa 7 ngày · OQ-03 cột CSV 集金 · OQ-04 fee-area · OQ-05 見積 LOGI CORE · OQ-06 メンテナンス enum · OQ-07 màn sau đăng ký · OQ-08 実績 賞味期限 · OQ-09 契約書 · OQ-10 nút 戻る · OQ-11 lỗi dịch vụ ngoài · OQ-12 empty state + lỗi hệ thống · OQ-13 rule màn tài xế · OQ-14 data model プロフィール · OQ-15 message tiếng Việt trong Figma · OQ-16 tab 添付資料 · OQ-17 chi tiết UI còn treo · OQ-18 log thay đổi hồ sơ công ty

## Feedback

_(chưa có — user điền vào đây, BA sẽ scoped update rồi tạo v2)_
