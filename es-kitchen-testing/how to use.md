# Hướng dẫn sử dụng QC Automation Agent

## Yêu cầu trước khi bắt đầu

- Máy tính đã cài **Claude Code** và đang trong thư mục dự án `AI_AGENTS_ES_KITCHEN`
- File `.env.test` đã có credentials (hỏi Tech Lead nếu chưa có)

---

## Cách chạy test cho 1 feature

### Bước 1 — Chuẩn bị 4 thông tin

| # | Thông tin | Lấy ở đâu |
|---|---|---|
| 1 | **Feature path** | Đường dẫn folder feature trong `es-kitchen-docs/docs/features/` |
| 2 | **Figma URL** | Mở SPEC.md → section `## Screens` → copy link Figma |
| 3 | **App cần test** | `web-supplier` / `web-admin` / `web-company` / `web-outsource` / `webapp-driver` |
| 4 | **URL website** | URL môi trường DEV đang chạy (hỏi Dev nếu chưa biết) |

### Bước 2 — Nhắn vào Claude Code

```
Hãy là QC Automation, test feature: <feature-path>, Figma: <figma-url>, app: <target-app>, website: <url>
```

**Ví dụ thực tế:**
```
Hãy là QC Automation, test feature: es-kitchen-docs/docs/features/supplier-ordering, Figma: https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=16479-123381, app: web-supplier, website: https://dev-sp.es-kitchen.co.jp
```

### Bước 3 — Chờ agent chạy

Agent sẽ tự động:
- Đọc SPEC.md và Figma
- Tạo file test
- Chạy test trên trình duyệt (sẽ thấy Chrome tự mở)
- Xuất báo cáo kết quả

### Bước 4 — Xem kết quả

Báo cáo xuất ra tại:
```
es-kitchen-testing/reports/<feature>/execution-report.md
```

| Kết quả | Ý nghĩa | Việc cần làm |
|---|---|---|
| ✅ PASS | Test vượt qua | Không cần làm gì |
| ❌ FAIL | Test thất bại | Chụp lỗi gửi Dev, xem screenshot trong `reports/screenshots/` |
| ⏭ SKIP | Tính năng chưa implement | Ghi nhận, chờ Dev làm xong rồi chạy lại |

---

## Chạy lại test (không cần agent)

Khi Dev đã fix lỗi, nhắn vào Claude Code hoặc chạy lệnh trong terminal:

```bash
cd es-kitchen-testing
npx playwright test e2e/web-supplier/<feature>/ --project=web-supplier --headed
```

Thay `web-supplier` và `<feature>` cho đúng app và feature đang test.

---

## Khi test báo lỗi đăng nhập

Session đăng nhập đã hết hạn. Chạy lệnh sau để đăng nhập lại:

```bash
cd es-kitchen-testing
npx playwright test --project=setup:e04
```

Thay `e04` bằng role tương ứng: `e02` / `e03` / `e04` / `e05` / `e06`

---

## Xem báo cáo trực quan

```bash
cd es-kitchen-testing
npx playwright show-report reports/html
```

Trình duyệt sẽ mở trang HTML hiển thị toàn bộ kết quả, screenshot lỗi, và video (nếu có).

---

## Hỏi đáp nhanh

**Q: Figma URL lấy ở đâu?**
Mở Figma → click vào frame màn hình → chuột phải → **Copy link to selection**

**Q: Có thể chạy 1 test case cụ thể không?**
```bash
npx playwright test e2e/web-supplier/<feature>/tc-auto-012-*.spec.ts --project=web-supplier --headed
```

**Q: Test FAIL nhưng tính năng đúng, làm sao?**
Gửi screenshot + error message trong `execution-report.md` cho người phụ trách automation để cập nhật selector.

**Q: Chạy xong không thấy báo cáo?**
Kiểm tra lại folder `es-kitchen-testing/reports/<feature>/` — file `execution-report.md` sẽ ở đó.
