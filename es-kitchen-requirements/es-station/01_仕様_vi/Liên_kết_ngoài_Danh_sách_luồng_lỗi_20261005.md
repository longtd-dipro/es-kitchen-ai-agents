# Luồng lỗi liên kết bên ngoài (danh sách mô phỏng khi kiểm thử) (2026/10/05)

Danh sách phục vụ sổ quyết định E "Cách xử lý liên kết bên ngoài trong demo" (2026-10-05・#38 = C) và sổ tiếp nhận No.54.
- **Demo**: liên kết bên ngoài (Cognito・Bill One・Yamato／THOMAS・HubSpot) **chỉ là chuyển động mẫu**. Khi bấm thì trạng thái thay đổi theo luồng, và màn hình hiển thị "(Demo)" (khi `NEXT_PUBLIC_DEMO=1`).
- **Giai đoạn kiểm thử**: chỉ mô phỏng để xác nhận **các luồng lỗi đã được quy định trong đặc tả** bên dưới. Không làm cho demo.
- Việc tách cổng API (mock／thật) để sau (sổ quyết định E 2026-10-05). Hiện chỉ nhà cung cấp có cổng (`lib/api/supplier.{mock,http}.ts`).

| No | Liên kết | Luồng lỗi | Hành vi mong đợi | Đặc tả | Màn hình・dữ liệu hiện tại |
|---|---|---|---|---|---|
| E1 | THOMAS (chỉ thị xuất hàng) | Gửi chỉ thị xuất hàng thất bại | Không khóa (vẫn sửa được)・thử lại (số lần định sẵn)・nếu không được thì cần xác nhận "Gửi chỉ thị xuất hàng thất bại" | Giao_hàng_12_API_batch_và_liên_kết_ngoài.md §15.7・§16.6・§16.14 | Loại cần xác nhận `出荷指示の送信失敗` (`lib/ops/delivery/constants.ts`) |
| E2 | THOMAS (chỉ thị xuất hàng) | Đổi ngày・số lượng／hủy sau khi đã gửi | Tăng số phiên bản và gửi lại (hủy thì gửi lại với số lượng 0) | Giao_hàng_12_API_batch_và_liên_kết_ngoài.md §19.2 | Cần xác nhận `出荷指示の再送`・`shipRev` |
| E3 | Yamato (vận đơn) | Lỗi nhập số vận đơn (sai định dạng・không tìm thấy giao hàng) | Dừng với lỗi theo từng dòng (các dòng khác vẫn nhập) | Giao_hàng_12_API_batch_và_liên_kết_ngoài.md §19.3・§19.5 | Cần xác nhận `取込エラー` |
| E4 | Yamato (vận đơn) | Vận đơn đến trước khi xuất hàng | Hiển thị vào cần xác nhận như một bất thường | Giao_hàng_12_API_batch_và_liên_kết_ngoài.md §16.11・§19.3 | Cần xác nhận `送り状の先行` |
| E5 | THOMAS (kết quả xuất hàng) | Nhập kết quả xuất hàng NG・số lượng không khớp | Cần xác nhận "Kết quả xuất hàng NG"・hiển thị chênh lệch số lượng | Giao_hàng_12_API_batch_và_liên_kết_ngoài.md §19.4 | Cần xác nhận `出荷実績NG` (bản thân việc nhập chưa triển khai) |
| E6 | Chung cho nhập | Sai mã ký tự・định dạng cột | Lỗi toàn file (không nhập) | Giao_hàng_12_API_batch_và_liên_kết_ngoài.md §19.5・CSV入出力_定義 | Nhập CSV (`lib/csv`) |
| E7 | Tạo | Thất bại khi tạo xác định・tính lại | Nhặt lại bằng `plan_recheck` | Giao_hàng_12_API_batch_và_liên_kết_ngoài.md §15.16・§16.5 | — |
| E8 | Bill One (hóa đơn) | Lỗi gửi hóa đơn (timeout, v.v.) | Lỗi gửi → Vận hành gửi lại → đã gửi. Cảnh báo ở TOP vận hành | Giao_hàng_12_API_batch_và_liên_kết_ngoài.md §16.7・Thiết kế cơ bản §"Lỗi gửi Bill One" (WEB No.65) | `advanceSend` (lỗi・gửi lại)・TOP vận hành "Lỗi gửi Bill One" |
| E9 | Batch hàng ngày | Xử lý thất bại | Chỉ hoàn tác phần ghi của xử lý đó, chuyển sang xử lý tiếp theo. Thông báo cho quản trị hệ thống | Sổ quyết định E "Cách chạy batch trên môi trường thật" | `lib/domain/batch.ts` (`runDaily`) |

**HubSpot (gửi liên hệ thất bại)**: hiển thị lỗi trên Web doanh nghiệp, để khách hàng gửi lại. Không lưu lại ở ES・không có chức năng gửi lại (hong quyết định 2026-10-05・sổ quyết định).

**Chưa có trong đặc tả (quyết định nếu cần)**: Cognito (thất bại khi đăng nhập・đặt lại mật khẩu).
