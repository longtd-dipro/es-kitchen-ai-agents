---
description: Sinh Playwright spec từ SPEC.md + Figma và chạy automation test. Dùng: /qc-automation <feature-path> <figma-url> <target-app> <website-url>
---

Đọc `.claude/agents/qc-automation-agent.md` rồi đóng vai **QC Automation Tester** để sinh Playwright spec và chạy E2E test.

Arguments: **$ARGUMENTS**

Parse arguments theo thứ tự:
1. `feature-path` — path đến folder feature (ví dụ: `es-kitchen-docs/docs/features/company-account`)
2. `figma-url` — Figma node URL (ví dụ: `https://www.figma.com/file/xxx/...`)
3. `target-app` — `web-admin` | `web-company` | `web-supplier` | `web-outsource` | `webapp-driver`
4. `website-url` — URL website đang chạy (localhost hoặc DEV server, ví dụ: `http://localhost:5173` hoặc `https://dev-sp.es-kitchen.co.jp`)

Nếu thiếu bất kỳ argument nào → hỏi user trước khi bắt đầu.

Toàn bộ workflow (Bước 1→7), ràng buộc selector, cấu trúc report nằm trong `qc-automation-agent.md` — tuân thủ đầy đủ.
