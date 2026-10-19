# ES-STATION — Long-term Requirements Memory (cho ba-agent)

> **Nguồn:** `es-kitchen-requirements/es-station/` (đặc tả ES Station Phase 2 do khách/PM chốt, tháng 9–10/2026). Bản đọc chính: `01_仕様_vi/` (dịch Việt); bản gốc Nhật: `01_仕様/`.
> **Mục đích:** `ba-agent` đọc **trước khi viết SPEC / Discovery** để (1) không mâu thuẫn quy tắc đã chốt, (2) biết file chuẩn nằm ở đâu, (3) biết điểm còn mở cần hỏi lại.
> **Digest tạo:** 2026-10-08, bằng AI tóm tắt từ bộ P1 (41 file). Đây là **bản tóm tắt tra cứu**, không thay nguồn: khi viết rule quan trọng (số tiền, hạn chốt, trạng thái) PHẢI mở lại § trong file nguồn mà digest dẫn.

---

## Thứ tự ưu tiên khi mâu thuẫn

1. **Sổ quyết định** `docs/決定台帳.md` — hiệu lực cao nhất. ⚠️ File này **không nằm trong `es-station`** và chưa có trong repo AI-kit → nếu cần xác nhận một quyết định, hỏi PM/user hoặc xin file, **không đoán**.
2. File "Nguồn chuẩn" của từng thư mục (bảng bên dưới).
3. File ghi "Đã đóng băng (tài liệu gốc)" chỉ để xem quá trình — **không dùng làm căn cứ, không đề xuất từ đó**. Toàn bộ `00_Quyết_định/` đã đóng băng.
4. Mục ghi *đề xuất / demo / tạm [tạm] / 【Cần xác nhận】* **chưa phải quy tắc** → đưa vào Open Questions, không viết thành AC.

## Khi nào đọc file nào

| Tình huống BA | Đọc |
|---|---|
| Bất kỳ SPEC nào chạm ES Station (đọc trước) | `domains/quy-uoc-chung.md` (mã màn hình, message/email, quyền 7 vai trò, CSV, danh sách, ngày giờ) |
| Chu kỳ giao hàng, kế hoạch, picking, xuất hàng, tài xế, sự cố giao | `domains/giao-hang.md` |
| Doanh nghiệp / cơ sở / hợp đồng cha-con, form đăng ký | `domains/doanh-nghiep-co-so-hop-dong.md` |
| Đơn thay đổi (8 loại) & phê duyệt | `domains/don-yeu-cau.md` |
| Master gói / dòng máy / tùy chọn / giảm giá, quy tắc thanh toán, hóa đơn (Bill One) | `domains/master-phi-thanh-toan.md` |
| Menu tháng, master sản phẩm | `domains/menu-san-pham.md` |
| Đơn hàng tháng, đơn vật tư, quản lý đơn của Vận hành | `domains/don-hang.md` |
| Đặt hàng NCC, trang nhà cung cấp, nhập kho | `domains/dat-hang-nhap-kho.md` |
| Tồn kho kho/cơ sở, kiểm kê | `domains/ton-kho.md` |
| Sản phẩm lỗi / hàng thay thế | `domains/hang-thay-the.md` |
| Đại lý, phí giới thiệu | `domains/dai-ly.md` |
| Mẫu kinh doanh / mẫu thử | `domains/mau-kinh-doanh.md` |
| TOP, Dashboard, đánh giá, thông báo, liên hệ (màn hình vận hành & doanh nghiệp) | `domains/man-hinh-van-hanh-doanh-nghiep.md` |

**Đọc đúng 1–2 digest liên quan**, không nạp tất cả (POLICIES.md: không đọc rộng ngoài phạm vi). Mỗi digest có cùng 7 mục: Phạm vi & actors · Thuật ngữ & định danh · Quy tắc đã chốt · Trạng thái & dữ liệu · Liên kết · Điểm mở · Checklist cho BA.

## Bản đồ thư mục nguồn

| Digest | Thư mục VI (`01_仕様_vi/`) | Thư mục gốc JA (`01_仕様/`) | File chuẩn | Domain gần nhất trong `business-flows/domains/` |
|---|---|---|---|---|
| giao-hang | `10_Giao_hàng/Đặc_tả_giao_hàng/` | `10_配送/配送仕様/` | `配送_00`–`12` | giao-hang-dieu-phoi · giao-hang-doi-tac · giao-hang-tai-xe · thu-tien-huy |
| doanh-nghiep-co-so-hop-dong | `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/` | `20_法人・拠点・契約/` | `Đặc_tả_hợp_đồng/`, `Form_đăng_ký.md` | hop-dong · user-binding |
| don-yeu-cau | `30_Đơn_yêu_cầu/` | `30_申請/` | `Đơn_yêu_cầu_và_phê_duyệt.md` | hop-dong |
| master-phi-thanh-toan | `40_Master_Phí_Thanh_toán/` | `40_マスタ・料金・請求/` | 3 file (Master, Định nghĩa Tùy chọn/Giảm giá, Quy tắc thanh toán) | thanh-toan |
| menu-san-pham | `45_Menu_Sản_phẩm/` | `45_メニュー・商品/` | `Master_Menu_Sản_phẩm.md` | menu-order |
| don-hang | `50_Đơn_hàng/` | `50_注文/` | `Đơn_hàng.md` | menu-order |
| dat-hang-nhap-kho | `55_Đặt_hàng_Nhập_mua_Nhập_kho/` | `55_発注・仕入・入荷/` | `Đặt_hàng_Nhập_mua_Nhập_kho.md` | dat-hang-ncc |
| ton-kho | `60_Tồn_kho/` | `60_在庫/` | `Tồn_kho.md` | ton-kho-thiet-bi |
| hang-thay-the | `65_Hàng_thay_thế/` | `65_代替品/` | `Hàng_thay_thế.md` | (liên quan giao-hang, ton-kho) |
| dai-ly | `70_Đại_lý/` | `70_代理店/` | `Đại_lý_và_giới_thiệu.md` | (chưa có domain tương ứng) |
| mau-kinh-doanh | `75_Mẫu_kinh_doanh/` | `75_営業サンプル/` | `Mẫu_kinh_doanh.md` | (chưa có domain tương ứng) |
| man-hinh-van-hanh-doanh-nghiep | `80_Màn_hình_vận_hành_và_doanh_nghiệp/` | `80_運営・法人の画面/` | `Màn_hình_vận_hành_và_doanh_nghiệp.md` | user-engagement · system-other |
| quy-uoc-chung | gốc `01_仕様_vi/` | gốc `01_仕様/` | `Quy_ước_mã_màn_hình`, `Thiết_kế_cơ_bản_Đề_xuất…`, `Bảng_phân_quyền_Web_vận_hành`, `Định_nghĩa_nhập_xuất_CSV`, `Liên_kết_ngoài_Danh_sách_luồng_lỗi` | screen-code-rule.md |

Cột "domain gần nhất" là **ánh xạ tham khảo** (suy luận), không phải quan hệ chính thức; `business-flows/` dựa trên `function_list.xlsx`, còn `es-station` là đặc tả chi tiết hơn và **mới hơn** → khi hai bên khác nhau, ưu tiên `es-station`, và ghi chênh lệch vào SPEC (Open Questions).

## Sơ đồ & tài liệu kèm theo

- Sơ đồ dataflow theo từng thư mục: `es-kitchen-requirements/es-station/summary/flow/<thư mục>/` (archify, mới qua kiểm tra tự động). Bảng tổng hợp: `summary/table_of_content.md`.
- Phân loại P1–P4 các file đặc tả: `es-kitchen-requirements/es-station/Danh_sách_file_vi_cần_đọc.md`.
- Thiết kế màn hình (HTML song ngữ) và ghi chú xác nhận: `es-kitchen-requirements/es-station/05_画面設計書(_vi)/`.

## Quy ước dùng chung đáng nhớ (chi tiết ở `domains/quy-uoc-chung.md`)

- Mã màn hình `<Module(2)>_<Feature(4)>_<Seq(3)>`; site: `AW_` vận hành · `CW_` doanh nghiệp · `SW_` NCC · `OW_` công ty vận chuyển · `DA_` tài xế · `UA_` người dùng. Seq = số màn hình, không phải số trạng thái.
- Web vận hành có **7 vai trò** (bảng phân quyền chính thức thay bảng cũ); Web doanh nghiệp chỉ có 2 loại tài khoản (doanh nghiệp / cơ sở).
- Chốt thanh toán **ngày 20 → xác định ngày 25 → phát hành Bill One ngày 1 tháng sau**; hóa đơn gửi từ Bill One, không từ ES.
- `plan lifecycle` (draft/published/locked) và `delivery status` là **hai máy trạng thái khác nhau**, không gọi chung là "trạng thái".
- CSV: UTF-8, không có cột NEW/UPDATE/DELETE; khóa trùng ghi đè, khóa trống tạo mới; không xóa qua CSV.

## Lưu ý về độ tin cậy của digest

- Mỗi digest đánh dấu "(suy luận)" cho phần AI suy ra; các file dài (`40` Master 198 KB, `10` chương 11–12) mới đọc theo mục — phần chưa đọc kỹ được ghi trong digest/báo cáo, cần mở nguồn khi dính tới.
- Tài liệu nguồn còn mâu thuẫn nội bộ (mới/cũ); digest đã chọn bản mới và ghi ở mục 6 của từng file.
- Thư mục `01_仕様_vi`, `05_画面設計書_vi`, `summary/` hiện **chưa commit** (chỉ có ở máy local). Nếu không thấy, đọc bản gốc `01_仕様/` (JA).
- Khi đặc tả nguồn đổi → cập nhật digest tương ứng (tạo lại từ file nguồn), không sửa tay phần quy tắc.
