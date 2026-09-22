# Requirements Analysis: auth-dashboard (Delivery Partner Portal E05 P2)

## Summary

**Tính năng:** Cụm Xác thực + Trang chủ + Lịch trình của portal **Website Công ty vận chuyển** (委託配送先WEB · E05 Phase 2).

**Mục đích nghiệp vụ:** Cho phép công ty vận chuyển (đối tác được ES Kitchen ủy thác) tự đăng ký hợp tác, đăng nhập portal, tự đặt lại mật khẩu, và nắm được bức tranh lịch giao hàng được phân bổ (tháng/tuần) cùng thông báo từ ES Kitchen.

**Actors:**
- **Khách vãng lai** — đại diện công ty vận chuyển chưa có tài khoản (chỉ chạm `OW_AUTH_003/004/005`)
- **Outsource Admin** (委託配送先管理者) — actor chính, đã có tài khoản
- **System Admin (E03)** — duyệt hồ sơ `仮登録`, đăng お知らせ (KHÔNG thao tác trên E05, nằm ngoài phạm vi test module này)
- **System** — gửi email OTP, tự điền địa chỉ từ 郵便番号

**Luồng chính:** 4/9 business flow của SPEC — Flow 1 (Login) · Flow 2 (新規登録フォーム) · Flow 3 (Reset PW) · Flow 4 (ホーム) · Flow 5 (スケジュール).

**Platform:** **Web desktop** — viewport chuẩn duy nhất **1440×1024**. Không hỗ trợ mobile/tablet (SPEC `## Out of Scope` mục 9). Không đa ngôn ngữ — UI tiếng Nhật 100% (mục 8).

**Scope module này:** 9 màn — `OW_AUTH_001` · `OW_AUTH_002` · `OW_AUTH_003` · `OW_AUTH_004` · `OW_AUTH_005` · `OW_HOME_001` · `OW_ANNO_002` · `OW_SCHD_001` · `OW_SCHD_002`.

**Dependencies:**
- `es-kitchen-api` — endpoint auth (JWT), OTP store TTL 5 phút, `/schedule/monthly`, `/schedule/weekly`, dashboard, announcements
- Mail service — gửi mã OTP 4 chữ số
- 郵便番号 lookup API — tự điền 都道府県 / 市区町村 / 町域
- **Ngoài scope module:** luồng duyệt hồ sơ `仮登録` phía E03 (`es-kitchen-web-admin`), cụm 見積もり (LOGI CORE)

---

## Q&A — Ambiguities

| ID | Reference | Screen | Question (VN) + Assumption/Đề xuất | Impact | Severity | Status |
|---|---|---|---|---|---|---|
| AMB-01 | OQ-07 / RQ-016 | OW_AUTH_005, OW_AUTH_001 | Sau khi submit form đăng ký: (a) có màn xác nhận `OW_AUTH_005` không và nội dung gì? (b) khi user đăng nhập lúc hồ sơ còn `仮登録` thì hiện message gì? **Đề xuất:** có màn xác nhận + message riêng `「お申し込みは審査中です。」`. Canvas Figma KHÔNG có frame cho màn này. | Không test được điểm kết thúc của Flow 2 | **High** | **Answered (22/09)** — CÓ màn `OW_AUTH_005`; đăng nhập khi hồ sơ còn `仮登録` → message RIÊNG `「お申し込みは審査中です。」`, KHÔNG dùng chung message sai mật khẩu |
| AMB-02 | OQ-09 / RQ-024 | OW_AUTH_004 | Người đăng ký xem `契約書` bằng cách nào — link URL, popup, hay PDF tải về? Bảng Figma ghi rõ "chưa được xác nhận". **Đề xuất:** popup modal hiển thị nội dung hợp đồng. | Không viết được TC cho thao tác xem hợp đồng trước khi tick | Medium | TBD |
| AMB-03 | OQ-10 | OW_AUTH_003, OW_AUTH_004 | Form đăng ký 2 bước có nút `戻る` từ bước 2 về bước 1 không? Nếu có thì giữ dữ liệu đã nhập chứ? **Đề xuất:** có nút `戻る`, giữ nguyên dữ liệu. | Không test được khả năng quay lại sửa 18 field ở bước 1 | Medium | TBD |
| AMB-04 | OQ-11 | OW_AUTH_002, OW_AUTH_003, OW_AUTH_004 | Hành vi khi dịch vụ ngoài thất bại: gửi email OTP lỗi · 郵便番号 lookup API không phản hồi. **Đề xuất:** toast lỗi hệ thống + cho phép retry, KHÔNG mất dữ liệu đã nhập. | Không test được nhánh external integration fail (nhóm 8) | Medium | TBD |
| AMB-05 | OQ-12 | Toàn bộ 9 màn | Empty state + banner/toast lỗi mạng/500 + **màn hết phiên** chưa được thiết kế trong Figma. SPEC đang dùng message `[INFERENCE]`. Riêng 14 dòng `Full screen` (phiên hết hạn) chưa có Screen Code riêng. **Đề xuất:** khách duyệt bộ message chuẩn (JP) dùng chung + cấp 1 Screen Code cho màn hết phiên. | Expected Result của TC nhóm 3/4/5 không có message chuẩn để đối chiếu | Medium | TBD |
| AMB-06 | OQ-06 / RQ-015 | OW_HOME_001, OW_ANNO_002 | Badge `メンテナンス` map sang `NotificationType` nào? Enum hiện có 7 giá trị, không có giá trị Bảo trì. | Không test được badge phân loại thông báo loại Bảo trì | Low | TBD |
| AMB-07 | OQ-05 / RQ-014 | OW_HOME_001 | Link `「見積もり一覧へ」` và tiêu đề yêu cầu báo giá trỏ tới đâu? Cụm 見積 (`LOGI CORE`) đang NGOÀI scope. | Không test được 2 link ở khối C của trang chủ | Medium | TBD |
| AMB-08 | OQ-15 | OW_AUTH_004 | Một số error message trong Figma viết bằng **tiếng Việt** trong khi portal tiếng Nhật 100% (VD `「Chỉ có thể đăng ký tối đa 20 file.」`, message ghi chú >500 ký tự). Cần bản JP chính thức. | Expected Result sẽ sai ngôn ngữ nếu dev implement theo Figma | Medium | TBD |
| AMB-09 | OQ-01 / RQ-005 | Toàn bộ | Chốt 1 hệ Screen Code duy nhất. Hiện có 3 hệ (SPEC P1 `OW_DLVP_*` · Design-Technical `OW_AUTH/HOME/SCHD...` · Figma đặt sai tên frame). | Nếu đổi mã sau → phải sửa lại toàn bộ cột Traceability của bộ TC | Low | TBD |
| AMB-10 | SPEC AC-02 | OW_AUTH_001 | SPEC ghi rõ **KHÔNG có cơ chế khoá tài khoản** sau N lần sai (RQ-026, FACT từ bảng Figma). Xác nhận đây là quyết định có chủ đích chứ không phải thiếu sót bảo mật? | Nếu sau này thêm khoá TK → AC-02 đảo ngược, TC phải viết lại | **High** | **Answered (22/09)** — KHÔNG khoá tài khoản là quyết định CÓ CHỦ ĐÍCH. Vẫn viết 1 TC bảo mật ghi nhận hành vi hiện tại để phát hiện nếu sau này đổi |

> **TBD** = chưa được PM/BA/BrSE confirm · **Answered** = đã có câu trả lời

---

## Acceptance Criteria

| REQ ID | AC ID | AC Content | Status |
|---|---|---|---|
| RQ-003 | AC-01 | Nhấn `ログイン` khi ID trống → `「ログインIDを入力してください。」`; mật khẩu trống → `「パスワードを入力してください。」`; mật khẩu <8 ký tự hoặc thiếu chữ/số → `「8文字以上で、英字・数字を含めてください。」` | Confirmed |
| RQ-026 | AC-02 | Sai ID/mật khẩu 10 lần liên tiếp → tài khoản **vẫn đăng nhập được** khi nhập đúng (không có cơ chế khoá — CÓ CHỦ ĐÍCH) | Confirmed (AMB-10 đã chốt 22/09) |
| RQ-003 | AC-03 | Nhấn icon con mắt → trường mật khẩu chuyển `password` ↔ `text` | Confirmed |
| RQ-003 | AC-04 | Nhập mã bưu điện đủ 7 số rồi rời focus → 都道府県 / 市区町村 / 町域・番地 được điền tự động và vẫn sửa tay được | Confirmed |
| RQ-003 | AC-05 | Mã bưu điện không tồn tại → **không** hiện lỗi, **không** xoá giá trị đã nhập | Confirmed |
| RQ-003 | AC-06 | Nhập 委託配送先名 rồi rời focus → trường カナ tự sinh 全角カナ; nhập 半角カナ tay → `「カナは全角カナで入力してください。」` | Confirmed |
| RQ-003 | AC-07 | Nút `次へ` ở bước 1 disabled cho tới khi toàn bộ mục bắt buộc của bước 1 hợp lệ | Confirmed |
| RQ-003 | AC-08 | Dòng `メイン担当者` không có nút xoá; dòng `サブ担当者` có nút xoá | Confirmed |
| RQ-003 | AC-09 | Tick 1 vùng cha trong cây 対応エリア → toàn bộ tỉnh con được tick; bỏ tick 1 tỉnh con → vùng cha chuyển `－` (indeterminate) | Confirmed |
| RQ-003 | AC-10 | Nút `登録` ở bước 2 disabled cho tới khi 対応エリア ≥1, 保有車両 ≥1, 3 lựa chọn thiết bị đã chọn **và** đã tick đồng ý hợp đồng | Confirmed |
| RQ-002 | AC-11 | Submit form đăng ký thành công → hồ sơ ở trạng thái `仮登録`, **chưa** đăng nhập được cho tới khi E03 duyệt; đăng nhập lúc này hiện `「お申し込みは審査中です。」` | Confirmed (AMB-01 đã chốt 22/09) |
| RQ-027 | AC-12 | OTP nhập sai → `「認証コードが正しくありません。」`; quá 5 phút → `「認証コードの有効期限が切れています。」` | Confirmed |
| RQ-027 | AC-13 | Countdown gửi lại hiển thị định dạng `mm:ss` và link `再送信` chỉ bật khi countdown = `00:00` | Confirmed |
| RQ-028 | AC-14 | Đặt lại mật khẩu thành công → user **đã ở trạng thái đăng nhập**, nhấn `ホーム画面へ` vào thẳng `OW_HOME_001` không phải nhập lại credential | Confirmed |
| RQ-003 | AC-15 | Ô lịch của ngày hệ thống có viền xanh đậm và **chỉ duy nhất 1 ô** có viền này | Confirmed |
| RQ-003 | AC-16 | Ngày có đơn chưa gán tài xế hiển thị badge đỏ `⚠N件`; N = đúng số đơn chưa gán trong ngày đó | Confirmed |
| RQ-003 | AC-17 | Nhãn phân tuần đúng màu: tuần A = xanh dương, B = xanh lá, C = cam, D = hồng, tháng trước/sau = xám | Confirmed |
| RQ-003 | AC-18 | Click 1 ô lịch ở trang chủ → sang màn lịch **tuần** chứa ngày đó (không phải lịch tháng) | Confirmed |
| RQ-003 | AC-19 | Danh sách お知らせ sắp xếp mới nhất → cũ nhất, hiển thị thời gian tương đối `今日・HH:mm` / `昨日・HH:mm` | Confirmed |
| RQ-003 | AC-20 | Lịch tháng: mỗi ngày hiển thị badge số lượng riêng cho từng 温度帯 (❄ đông lạnh / 🗄 mát・thường / 📦 vật tư) | Confirmed |
| RQ-003 | AC-21 | Nút `今日` đưa lịch về tháng chứa ngày hệ thống | Confirmed |
| RQ-003 | AC-22 | Lịch tuần: ngày không có lịch giao hiển thị ô trống; tên điểm giao vượt khung → rút gọn `...` + tooltip khi hover | Confirmed |

**Tổng:** 22 AC — **22 Confirmed** · 0 TBD.  
> Chốt ngày 22/09/2026: AMB-01 + AMB-10 đã có câu trả lời → AC-11 và AC-02 chuyển Confirmed. 8 AMB còn lại (Medium/Low) auto-tag `[UNCONFIRMED]` ở TC liên quan theo rule severity-gated.

---

## Screen Inventory

> Đã cross-check với Figma. Nguồn: canvas `Delivery (P2)` node `26173:304942` (file `VKAAOyoSPvgoB3H2qdeeV3`) + 24 bảng 画面設計書 song ngữ JP/VN.

| Screen Code | Screen | Nguồn (Figma frame node) | Bảng 画面設計書 | Ghi chú |
|---|---|---|---|---|
| `OW_AUTH_001` | ログイン | `31498:191137` | `31498:194739` (7 dòng) | Có nút 新規登録 + link quên mật khẩu |
| `OW_AUTH_002` | パスワード再設定 (Wizard 4 bước) | `31498:191164` / `191181` / `191218` / `191258` / `191278` | `31498:195505` · `195506` · `195507` | 5 frame = 4 bước; 191181 vs 191218 chỉ khác OTP rỗng/đã nhập |
| `OW_AUTH_003` | 申し込むフォーム 1/2 — 基本情報 | `31498:191305` | `31498:195503` (21 dòng) | 18 field + bảng 担当者 thêm/xoá dòng |
| `OW_AUTH_004` | 申し込むフォーム 2/2 — 配送対応情報 | `31498:191407` | `31498:195504` (13 dòng) | Cây 対応エリア 3 tầng (8 vùng × 47 tỉnh) |
| `OW_AUTH_005` | 申し込み完了 | ❌ **KHÔNG có frame** | ❌ không có | `[INFERENCE]` — xem AMB-01 |
| `OW_HOME_001` | ホーム | `31498:189875` | `31498:194757` (20 dòng) | 3 khối: lịch tháng · お知らせ · 未回答見積依頼 |
| `OW_ANNO_002` | お知らせ詳細 | `31498:190280` | `31498:194740` (7 dòng) | Rich text (■ · ・ · đậm) |
| `OW_SCHD_001` | スケジュール（月表示） | `31498:190314` | `31498:194756` (22 dòng) | Bộ lọc 2 tầng + 凡例 |
| `OW_SCHD_002` | スケジュール（週表示） | `31498:191010` | `31498:194741` (7 dòng) | 7 cột, danh sách cuộn theo ngày |

**Tham chiếu bổ sung (BA output):**
- Figma Flow Tổng Quan: node `32079-49624`, page `Feature - Flow`
- Figma Screen Flow: node `32087-49623`, page `Feature - Flow` — Group 1 (Auth), Group 2 (ホーム), Group 3 (スケジュール) + bảng ⑦ ERROR/POPUP INDEX (E-001…E-070 thuộc module này)

---

## History
- v1 (22/09/2026): `/analyze-req` — khởi tạo từ SPEC.md v2 + Figma canvas `Delivery (P2)`
- v1.1 (22/09/2026): user chốt AMB-01 + AMB-10 → AC-11, AC-02 chuyển Confirmed
