> **Đã đóng băng (tài liệu gốc・2026-10-05). Từ nay không cập nhật.** Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định bị thay thế thì xem "G" trong sổ quyết định.

# Quyết định: Master tủ lạnh và cấu hình tủ lạnh theo gói (2026/09/29)

> Căn cứ: tài liệu của khách hàng "Kích thước tủ lạnh theo gói" (hình ảnh đính kèm chat ngày 2026/09/29).
> Tình trạng phản ánh ở cuối. Chỉ demo master dòng máy (v1.8) đã được phản ánh. Đặc tả (danh sách mục master §0.9-3・0.9-4) chưa phản ánh.
> [Bổ sung tối 2026/09/29] Tài liệu này chỉ được lưu trong dự án (claude.ai) và không có trong `01_仕様/` của thư mục ÉS (đã ghi ngược lại khi dọn dẹp công việc song song). Chưa gán số quyết định (28-xxx).

## Quyết định
| # | Quyết định | Nội dung |
|---|---|---|
| 1 | Cách giữ | Cấu hình tủ lạnh theo từng gói được **đăng ký nguyên bảng vào "Thiết bị cho thuê tiêu chuẩn" của master gói** (không tự động tính từ dung tích. Vì ranh giới không khớp với công thức) |
| 2 | ES400・500 | **84L+142L là tiêu chuẩn, 84L×2 là thay thế**. Khách hàng có thể chọn một trong hai khi đăng ký |
| 3 | ES600 trở lên | Trên Web doanh nghiệp **hiển thị cấu hình tiêu chuẩn, không cho chọn kích thước**. Thay đổi là qua tư vấn (Vận hành thay đổi) |
| 4 | Tủ đông | Tủ đông cũng có bảng tương tự → nhận tài liệu và đăng ký cùng dạng (chưa nhận) |

## Đề xuất đăng ký master dòng máy (phân loại tủ lạnh)
| ID dòng máy | Tên dòng máy (đề xuất) | Dung tích (L) | Số lượng lưu trữ tối đa | Tiền hàng tháng (tạm) |
|---|---|---|---|---|
| RF000001 | Tủ trưng bày lạnh 48L | 48 | Cần xác nhận (demo 50) | ¥5,000 |
| RF000002 | Tủ trưng bày lạnh 84L | 84 | Cần xác nhận | ¥6,000 |
| RF000003 | Tủ trưng bày lạnh 105L | 105 | Cần xác nhận | ¥6,500 |
| RF000004 | Tủ trưng bày lạnh 142L | 142 | Cần xác nhận | ¥7,000 |

Thay thế các giá trị tạm của demo (46L／84L／120L, tủ đông lạnh công nghiệp RF-1200／RF-1800). Ví dụ về loại cũ đã xóa được đánh lại số thành RF000008 (vì RF000005〜7 dễ nhầm với số cũ của tủ đông).

## "Thiết bị cho thuê tiêu chuẩn" của master gói (tủ lạnh)
Cấu trúc: Gói → Mẫu (tiêu chuẩn／thay thế) → Dòng (dòng máy + số lượng máy). + cờ "quyết định sau khi tư vấn".

| Gói | Số lần giao hàng | Tiêu chuẩn | Thay thế | Tư vấn |
|---|---|---|---|---|
| ES50 | 1 | 48L×1 | — | — |
| ES100 | 2 | 48L×1 | — | — |
| ES150 | 2 | 84L×1 | — | — |
| ES200 | 2 | 105L×1 | — | — |
| ES250 | 2 | 105L×1 | — | — |
| ES300 | 2 | 142L×1 | — | — |
| ES400 | 2 | 84L×1+142L×1 | 84L×2 | — |
| ES500 | 2 | 84L×1+142L×1 | 84L×2 | — |
| ES600 | 2 | 105L×1+142L×1 | — | ○ |
| ES650〜ES950 | 4 | 105L×1+142L×1 | — | ○ |
| ES1000 | 4 | 142L×2 | — | ○ |
| ES1100 | 4 | 142L×2 | — | ○ |

Ghi chú của tài liệu: ES600 trở lên sẽ tư vấn để quyết định không gian và mục đích sử dụng／nếu có vấn đề về ổ cắm・không gian thì tư vấn／không đặt ở nơi có ánh nắng trực tiếp.

## Ảnh hưởng đến các quyết định hiện có (sửa khi phản ánh)
- §0.9-3 "Thiết bị có trong gói là 1 máy・kích thước có thể chọn lại với số lượng lưu trữ tối đa ≧ số suất ES" → đổi thành **nhiều máy・chọn từ các mẫu**
- Tiêu chuẩn của dung tích là **số lượng giao hàng mỗi lần** chứ không phải số suất hàng tháng (ES50 = giao 1 lần, ES100 = giao 2 lần, cả hai đều 48L). OPEN⑬ được giải quyết bằng điều này
- Số lần giao hàng là mục của master gói (không giữ trong master dòng máy)
- Dù mẫu thay thế rẻ hơn tiêu chuẩn cũng không hoàn tiền (chênh lệch chỉ thanh toán khi dương, như trước đây)
- OPEN 12-3 (phân biệt tủ lạnh và tủ đông) vẫn dùng được phương án A là giữ bằng mẫu ở phía gói

## Cần xác nhận
- Số lượng lưu trữ tối đa (số cái)・kích thước・nhà sản xuất・tiền hàng tháng của từng dòng máy
- Có cho phép đổi sang kích thước lớn hơn (ví dụ: ES50 dùng 84L) bằng thanh toán chênh lệch không (có giữ quy tắc chênh lệch của §0.9-3 không)
- Bảng tủ đông (chỉ Standard hay không)

## Tình trạng phản ánh
| Tài liệu | Tình trạng |
|---|---|
| Demo master dòng máy (13_運営_機種プランマスタ.html・10_運営_まとめ.html) | **Đã phản ánh 4 dòng máy tủ lạnh ở v1.8 (2026/09/29)**. Phiên bản trước ở 02_デモ/履歴/v1.7_20260929_仮登録は申請詳細で編集/ |
| Tủ đông・hộp vật tư | Tủ đông chưa phản ánh (chờ tài liệu). Hộp vật tư thành 5 dòng máy ở v1.9 (`Quyết_định_v2.3_Bổ_sung_Mặc_định_hộp_vật_tư_20260929.md`) |
| Tên dòng máy ở màn hình đăng ký・hợp đồng・thanh toán (tủ đông lạnh công nghiệp RF-1200／RF-1800) | Chưa phản ánh |
| Danh sách mục master §0.9-3・0.9-4／Thiết bị cho thuê tiêu chuẩn của master gói | Chưa phản ánh |
| Bổ sung master gói (số lần giao hàng tiêu chuẩn của 28-154) | Đã tham chiếu tài liệu này làm nguồn của giá trị tủ lạnh |
