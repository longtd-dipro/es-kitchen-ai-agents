# Open Questions — App Tài Xế (E06 Phase 2)

> Nguồn: `SPEC.md` v2 (22/09/2026) · Figma `DA - update` (`16422:114492`)
> 34 câu phát sinh vì **Figma không định nghĩa** hoặc **chính Figma ghi 「要確認」** hoặc **các node Figma mâu thuẫn nhau**.
>
> ⚠️ Cột **"Gợi ý (chưa ghi vào SPEC)"** là đề xuất của BA để bạn quyết nhanh — **KHÔNG phải nội dung đã chốt**, chưa được đưa vào SPEC.md. Chỉ sau khi bạn điền cột **"Trả lời"** thì mới cập nhật SPEC + sinh test case tương ứng.

---

## NHÓM 1 — BLOCKING / CONFLICT (5 câu — chốt trước khi Tech Lead thiết kế)

| # | Câu hỏi | Nguồn Figma | Gợi ý (chưa ghi vào SPEC) | Trả lời |
|---|---|---|---|---|
| **OQ-08** | Message + hành vi khi **mất mạng** và khi **server lỗi 500 / maintenance**? Dùng chung 1 message cho toàn app hay theo từng màn? | 48 bảng Figma **không có dòng nào** thuộc nhóm Network / Server error | Dùng chung toàn app: mất mạng → Toast 「通信エラーが発生しました。電波状況をご確認ください。」 · 500 → Toast 「システムエラーが発生しました。しばらくしてから再度お試しください。」 Cả 2 giữ nguyên dữ liệu đang nhập, cho retry | |
| **OQ-09** | **JWT/session hết hạn** giữa lúc dùng app → xử lý thế nào? Có refresh token? Dữ liệu đang tick/nhập có được giữ? | Không có màn 「セッション切れ」 trong 95 frame | Có refresh token tự động; refresh thất bại → Modal 「セッションが切れました。再度ログインしてください。」 → về `DA_AUTHEN_001`. **Dữ liệu đang nhập KHÔNG giữ** (rủi ro cao ở `DA_RECV_001`, `DA_ESDL_002/003`, `DA_RPTD_002`) | |
| **OQ-23** | ⚠️ **Figma tự mâu thuẫn** — điều kiện hiện popup ở Step 3: connector ghi 「すべての差異が0以外」 (TẤT CẢ chênh lệch khác 0), bảng ghi 「差異が1件以上」 (CÓ ≥1 chênh lệch). Hai cách cho kết quả khác nhau | connector `23371:142972` **vs** table `23451:37606` mục 5.2 | Theo **bảng** (「差異が1件以上」): có ≥1 sản phẩm lệch số lượng thì hiện popup. Hợp lý nghiệp vụ hơn — chỉ cần 1 sản phẩm lệch là đã phải báo ES Kitchen | |
| **OQ-07** | `配送一覧` (khoảng tối đa 31 ngày) · `DA_RECV_001` · `DA_ESDL_002/003` có **phân trang** không? Trần số bản ghi mỗi lần tải là bao nhiêu? | Figma không mô tả pagination ở bất kỳ màn nào | 配送一覧: phân trang 20 bản ghi/lần + infinite scroll. `DA_RECV_001` và `DA_ESDL_002/003`: **tải hết 1 lần** (vì lọc/tìm kiếm chạy phía client), trần 200 dòng | |
| **OQ-34** | Tag MỚI sinh ra khi hoàn thành một phần (kho / COOL便) có **kế thừa `伝票番号`・`送り状番号`** cũ hay cấp mới? Có giới hạn số lần sinh tag liên tiếp không? | connector `18578:41563` · `18870:187993` — chỉ nói 「別の倉庫タグを自動生成する」, không nói cách đánh số | **Giữ nguyên `送り状番号`** của từng vận đơn (vì là mã vận đơn thật từ kho), tag mới chỉ cấp `伝票番号` mới. **Không giới hạn** số lần sinh | |

---

## NHÓM 2 — CONFLICT giữa các node Figma (2 câu còn lại)

| # | Câu hỏi | Nguồn Figma | Gợi ý (chưa ghi vào SPEC) | Trả lời |
|---|---|---|---|---|
| **OQ-32** | Mã màn khi tap thẻ từ Home ghi `DA_DLVR_001-11` (COOL) / `DA_DLVR_001-1` (ES), nhưng bảng mô tả chi tiết dùng `DA_COOL_001` / `DA_ESDL_000_*` | table `20235:148473` mục 5.6/6.6 **vs** table `23808:112206` / `23134:63310` | Dùng `DA_COOL_001` / `DA_ESDL_000_*` (bảng chi tiết); `DA_DLVR_001-*` là tên frame cũ còn sót, cần Designer đổi tên frame cho khớp | |
| **OQ-25** | Connector có 「Step 1 edit」「Step 2 edit」「Step 3 edit」「Step 5 edit」 — **thiếu 「Step 4 edit」**. Ảnh sau trưng bày (Step 4) có sửa lại được trong 7 ngày không? | connector `18870:15080/15085/15090/15100` | **Có sửa được** — Step 4 cũng là ảnh như Step 1, không có lý do nghiệp vụ để chặn. Thiếu connector là sót khi vẽ | |

---

## NHÓM 3 — Chính Figma ghi 「要確認」 (8 câu)

| # | Câu hỏi | Nguyên văn Figma | Gợi ý (chưa ghi vào SPEC) | Trả lời |
|---|---|---|---|---|
| **OQ-02** | 「もっと表示」 tải bao nhiêu thông báo mỗi lần? | `20319:242429` A.4: 「1回あたりの読込件数は要確認」 | 20 thông báo/lần | |
| **OQ-03** | Email hiển thị ở `DA_AUTHEN_002_02` có mask một phần không? | `20239:151066` mục 3: 「マスク方式の有無は要確認。⚠️」 | **Có mask**: `sa***@email.com` (giữ 2 ký tự đầu + domain) | |
| **OQ-04** | Link trong nội dung thông báo mở bằng browser ngoài hay WebView trong app? | `20319:242429` B.5: 「遷移方式は要確認」 | Mở **tab browser mới** (vì E06 là web app, không có WebView) | |
| **OQ-05** | File đính kèm thông báo hỗ trợ định dạng nào? Mở hay tải về? | `20319:242429` B.6: 「対応ファイル形式・表示方式は要確認」 | PDF / JPEG / PNG — **tải về** bằng browser, không xem inline | |
| **OQ-13** | Câu tiếp sau 「パスワードリセットに成功しました。」 là gì? | `20240:152458` mục 2: 「以降の文言は要確認 ⚠️」 | 「新しいパスワードでログインしました。」 | |
| **OQ-21** | 「※次回納品日 〇月〇日」 có hiển thị **năm** không? | `23335:36257` mục 4.3: 「年表示の有無は要確認」 | **Không** hiển thị năm (vì 次回納品日 luôn trong vòng vài tuần) | |
| **OQ-22** | Bấm 「戻る」 từ Step 2 về Step 1 có **giữ dữ liệu đã nhập** không? | `23335:36257` mục 6.1: 「入力データ保持の有無は要確認」 | **CÓ giữ** — giống Step 3 (`23451:37606` mục 5.1 ghi rõ 「入力データは保持される」), để nhất quán | |
| **OQ-31** | Đơn COOL便 **ngày tương lai** có hiện nút 「完了」 không? | `23808:112206` mục 15: 「未来日の配送での表示有無は要確認」 | **Không hiện** — giống ES配送便 (đơn tương lai ẩn nút 「陳列を開始する」) | |

---

## NHÓM 4 — Figma không định nghĩa (16 câu)

| # | Câu hỏi | Gợi ý (chưa ghi vào SPEC) | Trả lời |
|---|---|---|---|
| **OQ-01** | Tab 「マニュアル」 trong bottom nav — quét 95 frame **không có màn nào**. Nội dung là gì? | Màn xem tài liệu hướng dẫn trưng bày (như SPEC v1 mô tả: Quy trình · Chuẩn bị · Lấy đồ · Cách chụp ảnh · Trưng bày). **Cần Designer vẽ thêm** | |
| **OQ-06** | Empty state của 3 tab `配送一覧` khi khoảng ngày không có bản ghi? | 「該当する配送はありません。」 | |
| **OQ-10** | Cơ chế **refresh** khi admin đổi lịch/trạng thái lúc tài xế đang xem? | **Pull-to-refresh** thủ công (không polling, không WebSocket — giảm tải 4G) | |
| **OQ-11** | Hệ thống email (SES) không gửi được mã xác thực → app báo gì? | 「認証コードの送信に失敗しました。しばらくしてから再度お試しください。」 | |
| **OQ-12** | Token reset mật khẩu có thời hạn riêng ngoài 5 phút của mã 4 số? | Token 30 phút (tính từ lúc verify mã thành công đến khi submit mật khẩu mới) | |
| **OQ-14** | Truy cập trực tiếp `/reset-password/complete` mà chưa qua B3 thì sao? | Redirect về `DA_AUTHEN_001` | |
| **OQ-15** | API đánh dấu đã đọc lỗi → chấm đỏ có giữ nguyên? | **Giữ nguyên** chấm đỏ, không báo lỗi cho tài xế (retry lần mở sau) | |
| **OQ-16** | Admin xóa thông báo khi tài xế đang mở chi tiết → hiển thị gì? | 「このお知らせは削除されました。」 → về `DA_NOTI_001` | |
| **OQ-17** | Bật 「未受取のみ表示」/「未確認のみ表示」 khi đã tick hết → hiển thị gì? | 「未受取の荷物はありません。」 / 「未確認の商品はありません。」 | |
| **OQ-18** | API hoàn tất nhận hàng lỗi → trạng thái tick có giữ để thử lại? | **Giữ nguyên** toàn bộ tick + hiện Toast lỗi, cho bấm 「完了」 lại | |
| **OQ-19** | Thiết bị không mở được app điện thoại (`tel:`) hoặc camera → fallback? | `tel:` lỗi → hiện số 050-5784-2777 dạng text cho tài xế tự bấm. Camera lỗi → chỉ còn chọn file từ máy | |
| **OQ-20** | `DA_RECV_003` gồm item gì? Figma có symbol nhưng **không có bảng mô tả** | Giống `DA_RECV_001` nhưng: checkbox disabled (hiện trạng thái đã tick), **ẩn** nút 「完了」, back không hiện popup xác nhận | |
| **OQ-24** | Cảnh báo 実集金額 lệch hiển thị **dạng gì** (toast/banner/inline/modal)? Thông báo admin qua kênh nào? | **Inline error màu cam** ngay dưới ô `実集金額` (không chặn thao tác). Admin nhận qua thông báo in-app trên Admin Web | |
| **OQ-26** | `DA_COOL_001` bấm back khi đã tick ≥1 — có popup xác nhận hủy như `DA_RECV_001` không? | **Có** — dùng chung popup 「編集内容を破棄しますか？」 (`E-03`) để nhất quán | |
| **OQ-27** | `DA_RPTD_001` không có đơn `未配送` nào để báo cáo → hiển thị gì? | 「報告可能な配送はありません。」 + ẩn nút 「次へ」 | |
| **OQ-28** | Có breakpoint nào khác ngoài 390×844? Font scale theo viewport? | Chỉ 1 breakpoint mobile; layout co giãn 320px–480px, font **không** scale | |
| **OQ-29** | 20 ảnh × 10MB — có nén / retry / upload nền không? | **Nén client-side** xuống ≤2MB trước upload; retry tự động 3 lần; **không** upload nền | |
| **OQ-30** | URL của các màn ngoài `DA_AUTHEN_*`? | `/home` · `/notifications` · `/notifications/:id` · `/account` · `/deliveries` · `/warehouse/:id` · `/es/:id` · `/es/:id/step:n` · `/cool/:id` · `/trouble` · `/trouble/:id` | |
| **OQ-33** | Chat/hỗ trợ (HubSpot widget) có ở SPEC v1 nhưng **không có trong Figma** — còn trong scope Phase 2? | **Loại khỏi scope** Phase 2 (đã có tổng đài 050-5784-2777 thay thế) | |

---

## Cách trả lời

Bạn có thể:
1. **Đồng ý toàn bộ gợi ý** → nói "OK hết", tôi cập nhật SPEC (đổi `UNKNOWN` → `FACT (BrSE confirmed 22/09/2026)`) rồi sinh test case.
2. **Đồng ý phần lớn, sửa vài câu** → nói "OK hết trừ OQ-09 và OQ-23: <nội dung>".
3. **Chỉ chốt nhóm BLOCKING trước** → trả lời 5 câu nhóm 1 + 2 câu nhóm 2, phần còn lại tôi tag `[UNCONFIRMED]` trong test case.
4. **Gửi BrSE/khách** → file này ở `es-kitchen-docs/docs/features/delivery-driver/OPEN-QUESTIONS.md`, có thể export `.xlsx` nếu cần.
