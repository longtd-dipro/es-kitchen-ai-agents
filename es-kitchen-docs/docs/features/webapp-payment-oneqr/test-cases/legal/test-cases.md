# Test Cases — Legal | webapp-payment-oneqr

> **Feature:** webapp-payment-oneqr (E07 Web Payment One QR)
> **Module:** Legal — 利用規約 + プライバシーポリシー (1 URL, tab-switch UI)
> **AC cover:** AC-18
> **Mode:** QUICK
> **Actor:** End User (Guest)
> **Ngày:** 2026-09-10
> **Figma:** Refined 2026-09-10 — cross-ref từ Figma section ES-QR (node `27460:58432`, reused frame `[UA_MYPG_007]`).

**Figma UI baseline (WP_LEGAL_001):**
- Header (172px, bg app/200 `#fee28a`): title text **"規約・プライバシー"** center (Noto Sans JP Medium 18px), filter icon button left (36px), empty slot right.
- Main (rounded-t-24px, white, shadow yellow glow): tab bar 44px chứa 2 tab pill "**利用規約**" (active state: bg white) và "**プライバシーポリシー**" (inactive: text gray `#6e7781`), toggle content dưới.
- Content sections: section header 16px Medium (VD "1: サービスの利用", "2: 禁止事項") có underline dưới, body 14px Regular text `#424a53`.
- Bottom CTA: nút **"OK"** 52px, bg gradient yellow `#fac215` → `#ffc562`, border 2px `#fac215`, shadow yellow glow, text 18px Bold — thoát page.

---

## Test Cases

| TC ID | Tiêu đề | Preconditions | Steps | Expected Result | Priority | Screen Code |
|---|---|---|---|---|---|---|
| TC_WP_LEG_001 | Legal page — hiển thị gộp Terms + Privacy tại 1 URL | Guest session hợp lệ. | 1. Navigate `/legal` | - URL đúng `/legal` (không tách `/legal/terms`, `/legal/privacy` — BA-08)<br>- Header title "**規約・プライバシー**" center (Noto Sans JP Medium 18px, bg yellow `#fee28a`)<br>- Tab bar hiển thị 2 tab: "**利用規約**" (active, bg trắng) và "**プライバシーポリシー**" (inactive, text gray)<br>- Content section 利用規約 hiển thị mặc định (default active)<br>- Nút "**OK**" (yellow gradient) hiển thị ở bottom | Critical | `WP_LEGAL_001` |
| TC_WP_LEG_002 | Legal page — access từ Cart Confirm link | Guest session hợp lệ. Đang ở `/cart/confirm`. | 1. Tap link "利用規約とプライバシーポリシー" trong checkbox label | - Navigate `/legal`<br>- Trang render đầy đủ: header title, tab bar, section content, CTA "OK" | Critical | `WP_LEGAL_001` |
| TC_WP_LEG_003 | Legal page — access từ footer link | Guest session hợp lệ. Đang ở page có footer (VD Home). | 1. Scroll xuống footer<br>2. Tap link Legal trong footer | - Navigate `/legal`<br>- Trang render đầy đủ | High | `WP_LEGAL_001` |
| TC_WP_LEG_004 | Legal page — cả 2 section content hiển thị đủ (qua tab switch) | Guest session hợp lệ. | 1. Navigate `/legal`<br>2. Tap tab "**利用規約**" (mặc định active) → scroll xem content<br>3. Tap tab "**プライバシーポリシー**" → scroll xem content | - Tab "利用規約" content xuất hiện: section header có underline (VD "1: サービスの利用" 16px Medium, "2: 禁止事項"), body 14px Regular tiếng Nhật<br>- Tap tab "プライバシーポリシー" → content section プライバシー hiển thị<br>- Cả 2 tab đều có nội dung, không rỗng<br>- URL vẫn giữ `/legal` khi switch tab (không đổi route) | High | `WP_LEGAL_001` |
| TC_WP_LEG_005 | Legal page — nội dung tiếng Nhật | Guest session hợp lệ. | 1. Navigate `/legal` | - Nội dung hoàn toàn tiếng Nhật (`lang="ja"`)<br>- Font Noto Sans JP (Regular cho body, Medium cho header)<br>- Không placeholder, không tiếng Anh | Medium | `WP_LEGAL_001` |
| TC_WP_LEG_006 | Legal page — không yêu cầu session | Không có guest session (cookie hết hạn hoặc chưa quét QR). | 1. Navigate trực tiếp `/legal` từ browser mới | - Trang Legal vẫn load được<br>- Không redirect về `/invalid-code`<br>- Header + tab + CTA "OK" đều render | Medium | `WP_LEGAL_001` |
| TC_WP_LEG_007 | Legal — WP_LEGAL_002 không tồn tại (dropped) | — | 1. Navigate `/legal/terms`<br>2. Navigate `/legal/privacy` | - Cả 2 route redirect về `/legal` hoặc trả 404 (`WP_LEGAL_002` đã drop theo BA-08)<br>- Không có trang riêng cho từng loại | Medium | — |
| TC_WP_LEG_008 | Legal page — content BE serve (không hardcode) | Guest session hợp lệ. DevTools Network tab mở. | 1. Navigate `/legal`<br>2. Quan sát network request | - Nội dung load từ API (`/api/v1/user/legal/terms` và/hoặc `/api/v1/user/legal/privacy`)<br>- Không hardcode HTML trong FE bundle | Low | `WP_LEGAL_001` |
| TC_WP_LEG_009 | Legal page — back về Cart Confirm sau khi đọc | Guest session hợp lệ. Vào `/legal` từ link tại `/cart/confirm`. | 1. Tap link Legal từ `/cart/confirm`<br>2. Đọc xong → bấm browser back HOẶC tap nút "**OK**" ở bottom | - Navigate về `/cart/confirm`<br>- Checkbox state giữ nguyên (nếu đã tick thì vẫn tick)<br>- Cả 2 cách (browser back và OK button yellow gradient) đều đưa về cart confirm | High | `WP_LEGAL_001` |

---

## Traceability — AC → TC

| AC ID | TC IDs cover |
|---|---|
| AC-18 | TC_WP_LEG_001, TC_WP_LEG_002, TC_WP_LEG_003, TC_WP_LEG_004, TC_WP_LEG_005, TC_WP_LEG_006, TC_WP_LEG_007, TC_WP_LEG_008, TC_WP_LEG_009 |

---

## Figma observations (cần confirm với BA/Designer/Dev — recommend thêm TC ở round sau)

- **Header title text mismatch:** Figma hiện "**規約・プライバシー**", SPEC quote "利用規約とプライバシーポリシー" (checkbox label ở cart confirm). Cần Designer confirm chuỗi nào cho page title (rút gọn vs full).
- **UI tab switch (NEW behavior):** Figma dùng tab pill toggle giữa 利用規約 và プライバシーポリシー trên **cùng 1 URL** — align với BA-08 (1 URL), nhưng SPEC AC-18 chưa nói rõ có tab UI. **Recommend:** thêm TC riêng cho tab-switch state (active/inactive style) và deep-link tới specific tab (query param `?tab=privacy` chẳng hạn) nếu Dev implement.
- **CTA "OK" button (NEW element):** Figma có button OK yellow gradient ở bottom → SPEC không đề cập. **Recommend:** thêm TC dành riêng cho OK button (style verify, tap behavior — browser back vs navigate về referrer vs modal close). Behavior cần BA confirm.
- **Node ID reuse (design debt):** Figma node name là `[UA_MYPG_007]` — reused frame từ mobile app (E01), 390px width iPhone-only. Confirm với Designer việc port sang web E07 có đảm bảo desktop responsive (SPEC 9: `max-w-3xl` center).
- **Filter icon button ở header trái:** Không rõ role — có phải back button đơn thuần không? Figma dùng "Filter Icon" nhưng context là Legal page → có thể là nhầm asset. Cần Designer verify.
