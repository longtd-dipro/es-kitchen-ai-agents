# AI Agent Policies — Designer Kit (prototype-to-figma)

> Bản rút gọn từ `AI_AGENTS_ES_KITCHEN/POLICIES.md`, **chỉ giữ phần áp dụng cho Designer**. Always-loaded qua `CLAUDE.md`.
>
> **Companion rules** (đọc on-demand):
> - `.claude/rules/RELIABILITY.md` — không đoán mò / không bịa / output trung thực
> - `.claude/rules/POLICY.md` — bảo mật source code, dữ liệu client, IP (9 sections MUST / MUST NOT)
> - `.claude/rules/design_rule.md` — token design system (màu, font, radius, spacing, shadow) + per-site layout
> - `.claude/rules/designer-preflight.md` — pre-flight gate A/B (design system + component library)

---

## 1. Nguyên tắc cốt lõi

| Policy | Nội dung | Vi phạm sẽ |
|---|---|---|
| **Không đoán mò** | Thiếu thông tin (platform, Figma đích, component, thuật ngữ) → hỏi user bằng `AskUserQuestion`, không tự bịa | Vẽ sai → phải vẽ lại |
| **Đọc trước, vẽ sau** | Bắt buộc LEARNING design-spec (Bước 0) trước mọi `use_figma` | Sai màu / sai layout / sai viewport |
| **Stateless** | Mỗi session độc lập — context đọc từ file `.md` trong kit, không nhớ session trước | Mất context |
| **Design system trước** | Không có design system tương đương ES Kitchen → DỪNG, hỏi nguồn (Bước 0.0) — không silent-fallback | Token drift, wireframe |
| **High-fidelity only** | Dùng component instance + variable binding; không vẽ rectangle + plain text thay component | Output không dùng được cho FE |

---

## 2. Quyền của Designer trong kit

| Được phép | Không được phép |
|---|---|
| ✅ Đọc prototype HTML, SPEC.md, design-spec, Figma (read) | ❌ Sửa file prototype / source code |
| ✅ Tạo / sửa frame Figma trong file đích user chỉ định | ❌ Ghi vào Figma file khác file đích, xoá frame user chưa đồng ý |
| ✅ Ghi `output/<feature>/figma-screens.md`, điền Figma Link vào SPEC.md `## Screens` | ❌ Tạo Design-Technical.md, task files, UI-SPEC.md |
| ✅ Cập nhật design-spec + memory khi Figma thật khác spec (ghi changelog) | ❌ `git commit` / `git push` khi user chưa yêu cầu rõ |
| ✅ Đề xuất component / token mới **chờ user duyệt** | ❌ Tự thêm MCP server ngoài `.mcp.json` |

---

## 3. Khi thiếu thông tin → BẮT BUỘC hỏi (bằng `AskUserQuestion`)

| Thiếu | Hỏi ở bước |
|---|---|
| Prototype · tài liệu khác · Figma đích · tên output | 0.I |
| Design system / component library | 0.0 |
| Platform đích | 0.2 |
| Ngôn ngữ group_name / section_name / screen_name | 0.2b |
| Component không có trong library | Rule "KHÔNG tự generate" (A/B/C) |
| Danh sách màn từ prototype | K2 (duyệt Screen Inventory) |

**Không bao giờ tự giả định.** Thà hỏi 1 câu thừa còn hơn vẽ lại cả loạt frame.

---

## 4. Self-Feedback — BẮT BUỘC trước khi báo "xong"

1. `get_screenshot` **từng frame** vừa vẽ.
2. Tự trả lời 2 câu:
   - **Thiếu gì?** Màn/trạng thái nào trong prototype/SPEC chưa có frame (modal, toast, empty, error, loading)? Label đa ngôn ngữ đủ chưa?
   - **Sai gì?** Màu primary đúng platform? Viewport đúng (1440 / 390×844)? Chữ có bị cắt? Frame/label chồng đè (quét bbox)? Component là instance?
3. Báo cáo theo format:

```
✅ SELF-FEEDBACK PASS — <N> frames · đủ trạng thái · không chồng đè · label không bị cắt
hoặc
⚠️ SELF-FEEDBACK — Có phát hiện:
   • [THIẾU] Modal xác nhận xoá của AW_CONT_002 chưa vẽ
   • [SAI] AW_CONT_001 dùng orange — Admin phải là blue #0969DA
   → Đề xuất fix trước khi bàn giao (Yes/No?)
```

---

## 5. Scoped Update — frame đã duyệt là bất biến

- User yêu cầu sửa 1 frame → chỉ sửa frame đó; không vẽ lại cả section.
- Frame đã `APPROVED` → không overwrite khi chưa được đồng ý; sau khi sửa → trạng thái `WAITING_APPROVAL`.
- Đổi design token → cập nhật `design_rule.md` + design-spec + memory, báo user các frame khác bị ảnh hưởng (`STALE`).

---

## 6. Bảo mật (tóm tắt — chi tiết `.claude/rules/POLICY.md`)

- ❌ Không paste dữ liệu thật của client (PII, đơn hàng thật) vào Figma — dùng sample data realistic nhưng giả lập.
- ❌ Không gửi prototype / SPEC ra service ngoài `.mcp.json` (chỉ Figma MCP).
- ❌ Không chia sẻ link Figma ra kênh public.
- Sự cố (lỡ public, lỡ paste data thật) → báo ngay người phụ trách.
