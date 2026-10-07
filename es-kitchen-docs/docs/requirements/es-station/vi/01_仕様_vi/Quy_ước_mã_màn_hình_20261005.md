# Quy ước Mã màn hình (Screen Code) (2026-10-05・hong trả lời)

ID dùng để chỉ cùng một màn hình trong Thiết kế màn hình, yêu cầu (Spec/REQ), màn hình Figma và ticket. Chép lại theo câu trả lời Q7 của Thiết kế màn hình (2026-10-05) làm chuẩn.

## 1. Dạng

`<Module(2)>_<Feature(4)>_<Seq(3)>`　Ví dụ: `UA_PAYM_003`

| Phần | Nội dung |
|---|---|
| Module (2 ký tự) | Site/ứng dụng. Xem bảng bên dưới |
| Feature (4 ký tự) | Chức năng (4 chữ cái tiếng Anh viết hoa). Ví dụ: PAYM = Payment, PLAN = Master gói (Plan) |
| Seq (3 chữ số) | Số thứ tự của màn hình trong chức năng đó (001〜). **Không phải số của trạng thái (tab, modal, lỗi)** |

| Module | Đối tượng |
|---|---|
| UA | User App (ứng dụng cá nhân) |
| DA | Driver App (tài xế) |
| CW | Company Web (Web doanh nghiệp) |
| AW | Admin Web (Web quản trị viên vận hành) |
| SW | Supplier Web (site nhà cung cấp) |
| OW | Outsource Web (Web đơn vị giao hàng ủy thác) |

## 2. Quy định (bắt buộc)

- Duy nhất trong dự án (không trùng lặp)
- Khi có thêm màn hình thì chỉ **tăng số**. Không đổi mã của màn hình hiện có
- Chỉ đổi mã khi bản chất màn hình thay đổi (tách, gộp, thay đổi luồng, thay đổi đối tượng)

## 3. Vận hành

- Gắn mã màn hình vào tất cả tài liệu tương ứng như Spec/REQ, màn hình Figma, ticket
- Khi đã tách màn hình nhưng chưa có mã, người phụ trách task tự quyết định theo quy định trên rồi báo PM, hoặc báo PM để PM gắn sau

## 4. Cách dùng trong Thiết kế màn hình

- Ghi vào `SCREENS[].code` của dữ liệu (`docs/05_画面設計書/Dữ_liệu/*.py`). id của trạng thái (`VIEWS`) được đánh riêng từ 001〜
- Ví dụ: Master gói (Plan) (Web quản trị viên vận hành) = `AW_PLAN_001` Danh sách／`AW_PLAN_002` Chi tiết／`AW_PLAN_003` Đăng ký・chỉnh sửa

(Bản gốc bằng tiếng Việt. hong trả lời 2026-10-05 "Q7")
