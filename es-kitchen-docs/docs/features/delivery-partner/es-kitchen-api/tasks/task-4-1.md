# [BE] [Delivery_Web] — Integration: cụm スケジュール + 配送管理 (BE ↔ FE)

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
| Depends on | task-2-1→2-6, task-2-12, task-2-13, task-2-14 · task-3-5→3-17 |
| Song song với | task-4-2 |
| Estimate | ~6h |

## Mục tiêu
Chạy end-to-end BE-localhost ↔ FE-localhost cho toàn bộ luồng lịch và quản lý giao hàng, phát hiện lệch contract trước khi bàn giao QA.

## Context
- **Design-Technical.md (BE)** → §7.1, §7.2 · **Design-Technical.md (FE)** → §7.3
- **Figma-Analysis.md** → §2.3, §2.4

## Kịch bản kiểm thử tích hợp

| # | Kịch bản | Kỳ vọng |
|---|---|---|
| 1 | Mở `/schedule?tab=monthly` | Lưới tháng đúng số ngày; badge 件数 khớp dữ liệu DB |
| 2 | Đổi tháng bằng `<` `>` | Gọi API đúng tháng, không lỗi, giữ filter |
| 3 | Nhập từ khoá công ty + `検索` | Chỉ còn ngày có đơn của công ty đó (đối chiếu SQL trực tiếp) |
| 4 | Chuyển tab `週` | 7 cột đúng tuần, danh sách điểm giao khớp |
| 5 | Bấm 1 ngày trên lịch | Sang `/delivery-status` lọc đúng ngày |
| 6 | Lọc nâng cao 11 điều kiện | Kết quả khớp query DB tương ứng |
| 7 | Mở 配送詳細 của đơn đã có report | 4 tab hiển thị đủ; tab 実績 có số liệu 廃棄/陳列 |
| 8 | Mở 配送詳細 của đơn chưa có report | Tab 実績 hiển thị empty state, không lỗi 500 |
| 9 | Gán tài xế cho đơn trong hạn | Lưu thành công, toast hiện, list cập nhật |
| 10 | Gán tài xế cho đơn quá 7 ngày | FE disable nút; gọi API trực tiếp → BE trả `409 SHIPMENT_EDIT_LOCKED` |
| 11 | Dropdown tài xế | Có ô tìm kiếm, hiển thị số 配送件数 đúng theo ngày |

## Unit Tests
**Không áp dụng** — task này không viết code mới, chỉ chạy kiểm thử tích hợp thủ công.
Thay vào đó bắt buộc:
- [ ] Chạy full unit test 2 repo trước khi bắt đầu: `npm run test` (api) và `npm run test` (web) — **cả 2 phải xanh**
- [ ] Mọi lỗi phát hiện → tạo **Bug issue** riêng, không sửa trực tiếp trong task này

## Non-Regression Table
| Tính năng | Cách verify |
|---|---|
| `/delivery-blocks/timeline` và `/summary` | Vẫn trả đúng shape cũ (chưa xoá) |
| Tab lịch cũ | Vẫn mở được từ URL cũ |
| Màn 配送状況 cũ | Filter cũ hoạt động |

## Không được làm
- Không sửa code trong task này — chỉ test và báo lỗi (tạo Bug issue nếu phát hiện)
- Không test trên dữ liệu production

## Definition of Done
- [ ] 11/11 kịch bản pass hoặc có Bug issue kèm theo
- [ ] Ghi kết quả vào PR/Backlog comment
- [ ] Actual Hour · Status → `Done`
