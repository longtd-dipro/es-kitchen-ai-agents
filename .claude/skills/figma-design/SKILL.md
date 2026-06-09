# Skill: figma-design

> Reusable knowledge cho designer-agent và /read-figma command.
> Covers: Figma MCP read tools, write tool pointers, ESKITCHEN token mapping, templates, quality checklist.

---

## 1. Figma MCP — Read Tools

Gọi song song cho 1 node:

```
mcp__claude_ai_Figma__get_metadata(fileKey, nodeId)       → structure tree
mcp__claude_ai_Figma__get_design_context(fileKey, nodeId) → layout + colors + code
mcp__claude_ai_Figma__get_variable_defs(fileKey, nodeId)  → design tokens
mcp__claude_ai_Figma__get_screenshot(fileKey, nodeId)     → PNG screenshot
```

**Precondition:** Figma Desktop phải đang mở file. Verify: tool get_metadata available và không trả về "Invalid tool call".

**File key ESKITCHEN:** VKAAOyoSPvgoB3H2qdeeV3

---

## 2. Figma MCP — Write Tools

**BẮT BUỘC** load Figma built-in skills trước khi ghi:

```
Skill("figma-use")              ← load trước khi gọi use_figma
Skill("figma-generate-design")  ← load khi tạo screens từ layout description
```

Sau khi load → dùng use_figma theo hướng dẫn từ skill đó.

---

## 3. Scenario Decision Logic

Kiểm tra cột **Figma Link** trong ## Screens của SPEC.md:

```
Figma Link = TBD hoặc trống
  → Scenario A: TẠO MỚI
    1. Load figma-use skill
    2. Load figma-generate-design skill
    3. Tạo frames → đặt trong page "01. Design"
    4. Frame name = Screen Code (AW_MENU_001...)

Figma Link = URL hợp lệ
  → Scenario B: ĐỌC + ENRICH
    1. Gọi 4 read tools song song
    2. Map tokens → ESKITCHEN
    3. Viết context files
```

---

## 4. Token Mapping Quick Reference

Đọc .claude/rules/design_rule.md section 10–11 để biết per-site tokens.

| Figma raw | ESKITCHEN token |
|---|---|
| #0969DA | colors.semantics.company.500 (E03, E06) |
| #FAA51D | colors.primitives.orange.400 / admin.400 (E02) |
| #FAC215 | colors.primitives.yellow.400 / app.400 (E01) |
| #6639BA | colors.primitives.purple.600 (E04) |
| #8ACA0D | KHÔNG trong token table — dùng hex (E05) |
| radius 6px | borders.semantics.border-radius.action |
| radius 8px | borders.semantics.border-radius.halfmodal |
| radius 12px | borders.semantics.border-radius.modal |
| 16px padding | spacing.padding.16 |
| 24px padding | spacing.padding.24 |

---

## 5. Output Format — Update SPEC.md ## Screens

Designer Agent **KHÔNG tạo file `.md` riêng** (không UI-SPEC, không figma context). Output duy nhất là Figma URL điền vào bảng `## Screens` trong SPEC.md:

```markdown
## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn | Figma Link |
|---|---|---|---|---|---|---|
| AW_MENU_001 | Monthly Menu Management | E03 | E03 | List | ... | [Figma](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/...?node-id=<id>&m=dev) |
```

URL format: `https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=<frame-id>&m=dev`

> FE/Mobile/QC/QA agents khi cần đọc design sẽ tự gọi MCP `get_design_context` / `get_metadata` / `get_screenshot` từ URL này — không có pre-extracted context file.

---

## 6. Design Quality Checklist

Trước khi declare done per screen:

- [ ] Frame tạo thành công trong Figma page `01. Design`
- [ ] Frame name = Screen Code (vd `AW_MENU_001`)
- [ ] Color theme đúng per site (xem `design_rule.md` section 10–11)
- [ ] Layout structure đúng (sidebar width / header height per site)
- [ ] Components reuse từ `02. Local Component` page (không vẽ lại từ rectangle)
- [ ] Figma URL đã điền vào cột `Figma Link` của SPEC.md ## Screens
- [ ] Responsive behavior ghi chú nếu có Auto Layout
- [ ] Frame name = Screen Code trong Figma
