# [BE] [Delivery_Web] — Integration: cụm 配送スタッフ + 集金・駐車 + ホーム

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — Integration
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 6h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 4 — Integration |
| Repo | `es-kitchen-api` + `es-kitchen-web-outsource-web-private` |
| Depends on | task-1-1, task-2-7→2-11, task-2-15 · task-3-18→3-28 |
| Song song với | task-4-1 |
| Estimate | ~6h |

## Mục tiêu
Kiểm thử end-to-end cụm nhân viên giao hàng, thu tiền/đỗ xe và màn chủ.

## Kịch bản kiểm thử tích hợp

| # | Kịch bản | Kỳ vọng |
|---|---|---|
| 1 | Mở 配送スタッフ一覧 | Cột 免許 hiện thumbnail; cột アカウント状態 đúng `発行済み` / `未発行` |
| 2 | Lọc `未発行` + sắp xếp theo tên | Kết quả khớp DB |
| 3 | Chọn 2 nhân viên → `アカウント一括発行` → `発行する` | Mail gửi tới hộp thư test; trạng thái chuyển `発行済み` |
| 4 | Chọn 1 nhân viên **không có email** cùng 1 nhân viên hợp lệ | Modal hiện `一部エラーあり`, đúng 1 dòng lỗi `EMAIL_MISSING` |
| 5 | Bấm `再度実行` sau khi bổ sung email | Chỉ gọi lại dòng lỗi; dòng đó chuyển thành công |
| 6 | Phát hành lại cho nhân viên đã 発行済み | Trả `ALREADY_ISSUED`, **không gửi lại mail** |
| 7 | Mở 配送スタッフ詳細 → tab 変更履歴 | Có dòng log của lần phát hành ở bước 3 |
| 8 | Tab 担当配送情報 với khoảng ngày có dữ liệu | Bảng + 2 ô tổng khớp màn 集金管理 |
| 9 | Màn 集金管理: lọc khoảng ngày | 集金合計 + 駐車合計 khớp tổng dữ liệu DB |
| 10 | Bấm `CSV出力` | File tên `集金管理_...csv`, mở Excel JP không lỗi font, **đúng 7 cột mới** |
| 11 | Màn ホーム | 1 request duy nhất; lịch, お知らせ, 見積 hiển thị đủ |
| 12 | Bấm 1 お知らせ trên ホーム | Mở màn chi tiết; quay lại thấy đã đọc |

## Unit Tests
**Không áp dụng** — task này không viết code mới, chỉ chạy kiểm thử tích hợp thủ công.
Thay vào đó bắt buộc:
- [ ] Chạy full unit test 2 repo trước khi bắt đầu: `npm run test` (api) và `npm run test` (web) — **cả 2 phải xanh**
- [ ] Mọi lỗi phát hiện → tạo **Bug issue** riêng, không sửa trực tiếp trong task này

## Non-Regression Table
| Tính năng | Cách verify |
|---|---|
| `POST /drivers/:id/send-password` | Gửi mật khẩu cho 1 nhân viên vẫn hoạt động |
| Tạo / sửa / xoá nhân viên | CRUD cũ không đổi hành vi |
| `BillDetailPage` | Màn chi tiết thu tiền vẫn mở |
| Điều hướng sau khi đổi nhãn menu (task-3-28) | Mọi mục dẫn đúng màn |

## Không được làm
- Không test bằng email thật của khách hàng
- Không chạy bulk issue trên môi trường production

## Definition of Done
- [ ] 12/12 kịch bản pass hoặc có Bug issue kèm theo
- [ ] Kết quả ghi vào PR/Backlog comment
- [ ] Actual Hour · Status → `Done`
