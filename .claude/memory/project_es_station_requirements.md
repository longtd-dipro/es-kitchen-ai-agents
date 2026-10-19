---
name: project-es-station-requirements
description: BA Agent memory — bộ đặc tả ES Station (es-station/) đã tóm tắt thành digest theo 12 chủ đề + quy ước chung; thứ tự ưu tiên nguồn, bẫy dễ nhầm, điểm cần hỏi lại
metadata:
  type: project
---

Bộ đặc tả ES Station Phase 2 nằm ở `es-kitchen-requirements/es-station/` (`01_仕様_vi/` bản Việt, `01_仕様/` bản Nhật gốc, `05_画面設計書(_vi)/` thiết kế màn hình). Đã phân tích 2026-10-08 thành digest tra cứu ở `.claude/context/es-station/` (README + `domains/*.md`, 13 file, mỗi file 7 mục cố định).

**Why:** BA phân tích feature mới thường viết SPEC từ yêu cầu mơ hồ, trong khi khách đã chốt rule chi tiết (số tiền, hạn chốt, trạng thái, quyền) trong đặc tả này → SPEC mâu thuẫn, QC/Dev phải sửa lại. Tài liệu nguồn >3 MB nên không thể đọc hết mỗi lần.

**How to apply:**
- Mỗi lần phân tích feature chạm ES Station (hợp đồng, giao hàng, thanh toán, đơn hàng, tồn kho, NCC, menu, đại lý, thông báo…): đọc `.claude/context/es-station/README.md` → chọn **1–2** digest ở bảng "Khi nào đọc file nào"; luôn kèm `domains/quy-uoc-chung.md` khi SPEC có màn hình/message/quyền/CSV. Rule nào dùng làm AC phải mở lại § trong file nguồn mà digest dẫn.
- Thứ tự ưu tiên khi mâu thuẫn: **Sổ quyết định `docs/決定台帳.md`** > file "Nguồn chuẩn" trong từng thư mục > file đóng băng (chỉ xem lịch sử) > mục đề xuất/demo/[tạm]. `00_Quyết_định/` toàn bộ đã đóng băng — không trích làm căn cứ.
- `docs/決定台帳.md` **không có** trong repo AI-kit → không được đoán nội dung; hỏi PM/user hoặc xin file.
- Bẫy hay gặp: `plan lifecycle` (draft/published/locked) ≠ `delivery status` (Chờ xuất hàng…Hủy/Dừng); 7 vai trò Web vận hành (bảng phân quyền chính thức) ≠ bảng cũ 6 role; hóa đơn chốt ngày 20 → xác định 25 → phát hành Bill One ngày 1 tháng sau; Web doanh nghiệp chỉ có 2 loại tài khoản (doanh nghiệp / cơ sở).
- Điểm đã ghi "(suy luận)" hoặc "Cần xác nhận" trong digest → đưa vào Open Questions của SPEC, không viết thành AC. Khi đặc tả nguồn đổi: tạo lại digest từ nguồn, không sửa tay.
- `01_仕様_vi/`, `05_画面設計書_vi/`, `summary/` chưa commit (chỉ local); thiếu thì đọc `01_仕様/` bản JA.

Liên quan: [[feedback-ba-agent-04092026]] · [[project-designer-design-system]] · `.claude/context/business-flows/README.md` (business memory từ function_list.xlsx, cũ hơn es-station)
