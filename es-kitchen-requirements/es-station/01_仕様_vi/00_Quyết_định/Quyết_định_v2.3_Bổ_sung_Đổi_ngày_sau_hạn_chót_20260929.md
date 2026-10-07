> **Đã đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định đã bị thay thế, xem mục "G" của sổ cái.

# Quyết định bổ sung v2.3 số 8 — 2026/09/29 (Đổi ngày sau hạn chốt đặt hàng: đến trước ngày xuất hàng 1 ngày · giới hạn nơi đổi đến)

> Là bổ sung tiếp theo bổ sung 7 (`Quyết_định_v2.3_Bổ_sung_Lịch_trang_chủ_doanh_nghiệp_20260929.md` · #54~#62). **Phiên bản vẫn là v2.3**. Số là #63. Trích dẫn là [Quyết định v2.3 #63].
> Nguyên nhân: 2026/09/29 hong "Trường hợp sau khi chốt, có thể đổi ngày ở màn hình chi tiết. Nơi đổi đến thì giới hạn" (sau khi xem hướng dẫn "Không thể đổi ngày" của Chi tiết dữ liệu xuất hàng · giao hàng DL-261020-0021).
> Trả lời của hong cùng ngày: ① đến khi nào = **đến trước ngày xuất hàng 1 ngày** ② nơi đổi đến = **nửa đầu / nửa sau giống nhau của cùng chu kỳ** ③ điều kiện = **từng mục một (không hàng loạt) · bắt buộc có lý do · lạnh và đông lạnh cùng ngày thì di chuyển cùng nhau**.
> Quy tắc phản ánh như trước: **sửa đồng thời 3 nơi: ① giải thích nghiệp vụ ② bảng state / batch ③ mô hình dữ liệu**.

---

## 63. Sau hạn chốt đặt hàng, đến trước ngày xuất hàng 1 ngày vẫn có thể đổi ngày từ chi tiết dữ liệu giao hàng

[Ghi đè] **Sửa Quyết định v2.2 #1 "Sau hạn chốt đặt hàng không đổi ngày. Xử lý bằng hủy + sao chép"** (cũ: sau hạn chốt thì từ chối UPDATE ngày, cũng không giữ nhánh ngoại lệ dành cho vận hành. Quyết định lần 3 ngày 2026/09/22).

| Giai đoạn | Có thể làm gì | Cửa vào | Lý do | Nơi đổi đến |
|---|---|---|---|---|
| Trước hạn chốt đặt hàng | Vận hành có thể thay đổi từng mục hoặc hàng loạt (không đổi) | Màn hình lịch trình / Chi tiết dữ liệu giao hàng | Tùy ý | Không giới hạn |
| **Sau hạn chốt đặt hàng ~ trước ngày xuất hàng 1 ngày** | **Vận hành có thể thay đổi từng mục một** (không hàng loạt · không kéo thả) | **"Chỉnh sửa" của chi tiết dữ liệu giao hàng** | **Bắt buộc** | **Chỉ các ngày của nửa đầu (A · B) / nửa sau (C · D) giống nhau của cùng chu kỳ** |
| Từ ngày xuất hàng trở đi | Không đổi ngày. Hủy + sao chép (không đổi) | — | Lý do hủy · sao chép là bắt buộc | — |

- **Thời hạn**: đến **trước 1 ngày** của ngày xuất hàng hiện tại (ngày picking). Ngày xuất hàng mới cũng phải từ ngày mai trở đi.
- **Nơi đổi đến**: ngày của **cùng chu kỳ · cùng nửa đầu / nửa sau** với ngày giao hàng hiện tại. Không đổi giữa nửa đầu ⇔ nửa sau · sang chu kỳ khác (để số lượng · tháng thanh toán không bị lệch). Ngày xuất hàng **di chuyển cùng nhau, giữ lead time của hợp đồng** (sau hạn chốt không dùng "Chỉ định ngày riêng lẻ").
- **Ngày không thể chọn**: ngày không xuất hàng (ngày nghỉ định kỳ · ngày lễ · khung không thể của kho) · thứ không thể giao hàng · ngày được coi là ngày lễ giao hàng · tạm dừng chu kỳ. **Vượt giới hạn số lượng** thì hiển thị chữ đỏ nhưng chọn được (phán đoán của vận hành).
- **Cái di chuyển cùng nhau**: đông lạnh · lạnh của cùng cơ sở · cùng ngày giao (cùng quy tắc với đơn đăng ký thay đổi).
- **Không đổi kho picking** (như trước là hủy + sao chép · Quyết định v2.2 #3).
- **Chỉ thị xuất hàng**: nếu đã gửi (`locked`) thì **gửi lại bằng phiên bản mới** (`ship_order_diff`). Nếu chưa gửi thì được đưa vào lần xuất kế tiếp. `locked` không dùng để quyết định có đổi ngày được hay không (không đổi).
- **Ghi chép**: giữ dưới dạng override `override_type = fix`, để lại trong lịch sử thay đổi trước → sau · lý do · người thao tác. Thông báo "Ngày giao đã thay đổi" cho doanh nghiệp (văn bản trên màn hình · thông báo của doanh nghiệp để sau).
- **Màn hình**: **đổi từ "Chỉnh sửa" của chi tiết dữ liệu giao hàng**. Chỉ khi bấm "**Thay đổi**" ở ô "Ngày giao" của màn hình chỉnh sửa mới hiển thị **lịch nhỏ** (2 tuần nửa đầu / nửa sau giống nhau · 7 cột × 2 hàng) (2026/09/29 hong chỉ thị: chỉ hiển thị khi muốn thay đổi · chọn bằng lịch nhỏ. Cũ: nút "Đổi ngày" + modal làm cùng ngày, sau đó là bảng ứng viên luôn hiển thị ở màn hình chỉnh sửa. Cả hai đều hủy).
  - Ô: ngày · khung (A1~B7) · ngày xuất hàng · số lượng ngày xuất hàng. **Ngày không chọn được thì màu xám và không bấm được** (không xuất hàng · không giao hàng · ngày lễ · ngày hiện tại là nét đứt). **Vượt giới hạn số lượng là chữ đỏ** (chọn được). Ngày đã chọn có viền xanh.
  - Khi chọn thì ô "Ngày giao" "Ngày xuất hàng" đổi sang ngày mới, phía dưới hiển thị "Thay đổi từ ○/○ hiện tại". Dưới lịch có "Ngày giao ○ → ○, ngày xuất hàng → ○ sẽ thay đổi". "Hủy thay đổi" thì trả về như cũ và đóng.
  - Lý do dùng "Lý do thay đổi" (bắt buộc) của màn hình chỉnh sửa. Ngay sau khi mở thì không hiển thị lỗi (hiển thị khi bấm lưu).
  - Hướng dẫn sau hạn chốt của chi tiết là "Ngày chỉ có thể đổi từ 'Chỉnh sửa', đến trước ngày xuất hàng 1 ngày, chỉ đổi sang ngày của cùng nửa đầu / nửa sau của cùng chu kỳ (từng mục một · bắt buộc có lý do)". Hiển thị giai đoạn của màn hình lịch trình là "Đổi ngày từ chi tiết dữ liệu giao hàng từng mục một (đến trước ngày xuất hàng 1 ngày)".
- **API**: `PATCH /deliveries/{id}/dates` kể cả sau hạn chốt chỉ cho qua khi ① đến trước ngày xuất hàng 1 ngày ② cùng chu kỳ · cùng nửa đầu / nửa sau ③ 1 mục ④ có lý do. Nếu lệch thì `DOMAIN_ORDER_CLOSED` (quá hạn) / `DOMAIN_DATE_OUT_OF_RANGE` (ngoài phạm vi nơi đổi đến) [Đề xuất · tên mã sẽ xác định sau khi DEV xác nhận].
- **Mô hình dữ liệu**: không có cột mới. `delivery_date_overrides` (`override_type = fix`) giữ `reason` (bắt buộc sau hạn chốt). Phán định bằng `order_close_date` · `shipped_date` (ngày dự kiến xuất hàng) · `cycle_id` · tuần của khung (A~D).

## Tình trạng phản ánh

| Tài liệu | Trạng thái |
|---|---|
| Tài liệu đặc tả tổng hợp v2.3 (§0-2J · §8-3 · §9-2 chế độ đổi ngày · §19-11) | Phản ánh 2026/09/29 |
| Đặc tả DEV (§9.3 · §15.4) | Phản ánh 2026/09/29 |
| Thiết kế giao hàng (Version 47: Chỉnh sửa DeliveryDetail · lịch nhỏ · shared.css `.ddc*` · DeliveryEdit · Patterns · lịch trình tháng tuần ngày) · demo giao hàng (DKqa Version 17) | Phản ánh 2026/09/29 |
