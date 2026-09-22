# ESKitchen Design System — Token Reference

> **Purpose:** AI design input. Apply these tokens exactly when generating UI, components, or specifications for the ESKitchen product.

> **Font:** Noto Sans JP (default)

---

## 1. Color Primitives

Raw palette. Do not use these directly in components — reference via Semantics or Components layer.

### 1.1 Blue


| Token                        | Hex         |
| ---------------------------- | ----------- |
| `colors.primitives.blue.50`  | `#e5f6ffff` |
| `colors.primitives.blue.100` | `#ceedffff` |
| `colors.primitives.blue.200` | `#97d3ffff` |
| `colors.primitives.blue.300` | `#61b3ffff` |
| `colors.primitives.blue.400` | `#218bffff` |
| `colors.primitives.blue.500` | `#0969daff` |
| `colors.primitives.blue.600` | `#0550aeff` |
| `colors.primitives.blue.700` | `#033d8bff` |
| `colors.primitives.blue.800` | `#0a3069ff` |
| `colors.primitives.blue.900` | `#002155ff` |


### 1.2 Gray


| Token                        | Hex         |
| ---------------------------- | ----------- |
| `colors.primitives.gray.50`  | `#f6f8faff` |
| `colors.primitives.gray.100` | `#eaeef2ff` |
| `colors.primitives.gray.200` | `#d0d7deff` |
| `colors.primitives.gray.300` | `#afb8c1ff` |
| `colors.primitives.gray.400` | `#8c959fff` |
| `colors.primitives.gray.500` | `#6e7781ff` |
| `colors.primitives.gray.600` | `#57606aff` |
| `colors.primitives.gray.700` | `#424a53ff` |
| `colors.primitives.gray.800` | `#32383fff` |
| `colors.primitives.gray.900` | `#24292fff` |


### 1.3 Red


| Token                       | Hex         |
| --------------------------- | ----------- |
| `colors.primitives.red.50`  | `#fff6f5ff` |
| `colors.primitives.red.100` | `#ffe5e4ff` |
| `colors.primitives.red.200` | `#ffbbb9ff` |
| `colors.primitives.red.300` | `#ff8182ff` |
| `colors.primitives.red.400` | `#fa4549ff` |
| `colors.primitives.red.500` | `#cf222eff` |
| `colors.primitives.red.600` | `#a40e26ff` |
| `colors.primitives.red.700` | `#82071eff` |
| `colors.primitives.red.800` | `#660018ff` |
| `colors.primitives.red.900` | `#4c0014ff` |


### 1.4 Orange


| Token                          | Hex         |
| ------------------------------ | ----------- |
| `colors.primitives.orange.50`  | `#fff9ebff` |
| `colors.primitives.orange.100` | `#feedc7ff` |
| `colors.primitives.orange.200` | `#fdda8aff` |
| `colors.primitives.orange.300` | `#fbc14eff` |
| `colors.primitives.orange.400` | `#faa51dff` |
| `colors.primitives.orange.500` | `#f4860cff` |
| `colors.primitives.orange.600` | `#d86107ff` |
| `colors.primitives.orange.700` | `#b3410aff` |
| `colors.primitives.orange.800` | `#91320fff` |
| `colors.primitives.orange.900` | `#782a0fff` |


### 1.5 Yellow


| Token                          | Hex         |
| ------------------------------ | ----------- |
| `colors.primitives.yellow.50`  | `#fef9e8ff` |
| `colors.primitives.yellow.100` | `#fef0c3ff` |
| `colors.primitives.yellow.200` | `#fee28aff` |
| `colors.primitives.yellow.300` | `#fdd147ff` |
| `colors.primitives.yellow.400` | `#fac215ff` |
| `colors.primitives.yellow.500` | `#eab308ff` |
| `colors.primitives.yellow.600` | `#ca9a04ff` |
| `colors.primitives.yellow.700` | `#a16207ff` |
| `colors.primitives.yellow.800` | `#854d0eff` |
| `colors.primitives.yellow.900` | `#713f12ff` |


### 1.6 Green


| Token                         | Hex         |
| ----------------------------- | ----------- |
| `colors.primitives.green.50`  | `#edfdf0ff` |
| `colors.primitives.green.100` | `#c5f7d0ff` |
| `colors.primitives.green.200` | `#6fdd8bff` |
| `colors.primitives.green.300` | `#4ac26bff` |
| `colors.primitives.green.400` | `#2da44eff` |
| `colors.primitives.green.500` | `#1a7f37ff` |
| `colors.primitives.green.600` | `#116329ff` |
| `colors.primitives.green.700` | `#044f1eff` |
| `colors.primitives.green.800` | `#003d16ff` |
| `colors.primitives.green.900` | `#002d11ff` |


### 1.7 Purple


| Token                          | Hex         |
| ------------------------------ | ----------- |
| `colors.primitives.purple.50`  | `#fbefffff` |
| `colors.primitives.purple.100` | `#ecd8ffff` |
| `colors.primitives.purple.200` | `#d8b9ffff` |
| `colors.primitives.purple.300` | `#c297ffff` |
| `colors.primitives.purple.400` | `#a475f9ff` |
| `colors.primitives.purple.500` | `#8250dfff` |
| `colors.primitives.purple.600` | `#6639baff` |
| `colors.primitives.purple.700` | `#512a97ff` |
| `colors.primitives.purple.800` | `#3e1f79ff` |
| `colors.primitives.purple.900` | `#2e1461ff` |


### 1.8 Black &amp; White


| Token                     | Hex         |
| ------------------------- | ----------- |
| `colors.primitives.black` | `#000000ff` |
| `colors.primitives.white` | `#ffffffff` |


---

## 2. Color Semantics

Semantic layer maps primitive colors to intent. Use these in design decisions.


| Token                           | Maps to Primitive                 | Intent                      |
| ------------------------------- | --------------------------------- | --------------------------- |
| `colors.semantics.company.50`   | `{colors: primitives.blue.50}`    | Brand / primary action      |
| `colors.semantics.company.100`  | `{colors: primitives.blue.100}`   | Brand / primary action      |
| `colors.semantics.company.200`  | `{colors: primitives.blue.200}`   | Brand / primary action      |
| `colors.semantics.company.300`  | `{colors: primitives.blue.300}`   | Brand / primary action      |
| `colors.semantics.company.400`  | `{colors: primitives.blue.400}`   | Brand / primary action      |
| `colors.semantics.company.500`  | `{colors: primitives.blue.500}`   | Brand / primary action      |
| `colors.semantics.company.600`  | `{colors: primitives.blue.600}`   | Brand / primary action      |
| `colors.semantics.company.700`  | `{colors: primitives.blue.700}`   | Brand / primary action      |
| `colors.semantics.company.800`  | `{colors: primitives.blue.800}`   | Brand / primary action      |
| `colors.semantics.company.900`  | `{colors: primitives.blue.900}`   | Brand / primary action      |
| `colors.semantics.neutral.50`   | `{colors: primitives.gray.50}`    | UI structure, text, borders |
| `colors.semantics.neutral.100`  | `{colors: primitives.gray.100}`   | UI structure, text, borders |
| `colors.semantics.neutral.200`  | `{colors: primitives.gray.200}`   | UI structure, text, borders |
| `colors.semantics.neutral.300`  | `{colors: primitives.gray.300}`   | UI structure, text, borders |
| `colors.semantics.neutral.400`  | `{colors: primitives.gray.400}`   | UI structure, text, borders |
| `colors.semantics.neutral.500`  | `{colors: primitives.gray.500}`   | UI structure, text, borders |
| `colors.semantics.neutral.600`  | `{colors: primitives.gray.600}`   | UI structure, text, borders |
| `colors.semantics.neutral.700`  | `{colors: primitives.gray.700}`   | UI structure, text, borders |
| `colors.semantics.neutral.800`  | `{colors: primitives.gray.800}`   | UI structure, text, borders |
| `colors.semantics.neutral.900`  | `{colors: primitives.gray.900}`   | UI structure, text, borders |
| `colors.semantics.negative.50`  | `{colors: primitives.red.50}`     | Error, destructive, danger  |
| `colors.semantics.negative.100` | `{colors: primitives.red.100}`    | Error, destructive, danger  |
| `colors.semantics.negative.200` | `{colors: primitives.red.200}`    | Error, destructive, danger  |
| `colors.semantics.negative.300` | `{colors: primitives.red.300}`    | Error, destructive, danger  |
| `colors.semantics.negative.400` | `{colors: primitives.red.400}`    | Error, destructive, danger  |
| `colors.semantics.negative.500` | `{colors: primitives.red.500}`    | Error, destructive, danger  |
| `colors.semantics.success.50`   | `{colors: primitives.green.50}`   | Success, confirmation       |
| `colors.semantics.success.100`  | `{colors: primitives.green.100}`  | Success, confirmation       |
| `colors.semantics.success.200`  | `{colors: primitives.green.200}`  | Success, confirmation       |
| `colors.semantics.success.300`  | `{colors: primitives.green.300}`  | Success, confirmation       |
| `colors.semantics.success.400`  | `{colors: primitives.green.400}`  | Success, confirmation       |
| `colors.semantics.success.500`  | `{colors: primitives.green.500}`  | Success, confirmation       |
| `colors.semantics.info.50`      | `{colors: primitives.blue.50}`    | Informational               |
| `colors.semantics.info.100`     | `{colors: primitives.blue.100}`   | Informational               |
| `colors.semantics.info.200`     | `{colors: primitives.blue.200}`   | Informational               |
| `colors.semantics.info.300`     | `{colors: primitives.blue.300}`   | Informational               |
| `colors.semantics.info.400`     | `{colors: primitives.blue.400}`   | Informational               |
| `colors.semantics.info.500`     | `{colors: primitives.blue.500}`   | Informational               |
| `colors.semantics.warning.50`   | `{colors: primitives.yellow.50}`  | Warning, caution            |
| `colors.semantics.warning.100`  | `{colors: primitives.yellow.100}` | Warning, caution            |
| `colors.semantics.warning.200`  | `{colors: primitives.yellow.200}` | Warning, caution            |
| `colors.semantics.warning.300`  | `{colors: primitives.yellow.300}` | Warning, caution            |
| `colors.semantics.warning.400`  | `{colors: primitives.yellow.400}` | Warning, caution            |
| `colors.semantics.warning.500`  | `{colors: primitives.yellow.500}` | Warning, caution            |
| `colors.semantics.app.50`       | `{colors: primitives.yellow.50}`  | App-facing UI accent        |
| `colors.semantics.app.100`      | `{colors: primitives.yellow.100}` | App-facing UI accent        |
| `colors.semantics.app.200`      | `{colors: primitives.yellow.200}` | App-facing UI accent        |
| `colors.semantics.app.300`      | `{colors: primitives.yellow.300}` | App-facing UI accent        |
| `colors.semantics.app.400`      | `{colors: primitives.yellow.400}` | App-facing UI accent        |
| `colors.semantics.app.500`      | `{colors: primitives.yellow.500}` | App-facing UI accent        |
| `colors.semantics.app.600`      | `{colors: primitives.yellow.600}` | App-facing UI accent        |
| `colors.semantics.app.700`      | `{colors: primitives.yellow.700}` | App-facing UI accent        |
| `colors.semantics.app.800`      | `{colors: primitives.yellow.800}` | App-facing UI accent        |
| `colors.semantics.app.900`      | `{colors: primitives.yellow.900}` | App-facing UI accent        |
| `colors.semantics.admin.50`     | `{colors: primitives.orange.50}`  | Admin-facing UI accent      |
| `colors.semantics.admin.100`    | `{colors: primitives.orange.100}` | Admin-facing UI accent      |
| `colors.semantics.admin.200`    | `{colors: primitives.orange.200}` | Admin-facing UI accent      |
| `colors.semantics.admin.300`    | `{colors: primitives.orange.300}` | Admin-facing UI accent      |
| `colors.semantics.admin.400`    | `{colors: primitives.orange.400}` | Admin-facing UI accent      |
| `colors.semantics.admin.500`    | `{colors: primitives.orange.500}` | Admin-facing UI accent      |


---

## 3. Color Components

Component-specific color tokens. Use these directly when building UI components.


| Token                                | Maps to                           | Usage                                               |
| ------------------------------------ | --------------------------------- | --------------------------------------------------- |
| `colors.components.slot.fill`        | `{colors: primitives.purple.100}` | Slot/placeholder UI (e.g. empty state, drag target) |
| `colors.components.slot.stroke`      | `{colors: primitives.purple.600}` | Slot/placeholder UI (e.g. empty state, drag target) |
| `colors.components.slot.label.fill`  | `{colors: primitives.purple.600}` | Slot/placeholder UI (e.g. empty state, drag target) |
| `colors.components.divider.low`      | `{colors: semantics.neutral.100}` | Divider lines, separators                           |
| `colors.components.divider.middle`   | `{colors: semantics.neutral.200}` | Divider lines, separators                           |
| `colors.components.divider.high`     | `{colors: semantics.neutral.300}` | Divider lines, separators                           |
| `colors.components.text.low`         | `{colors: semantics.neutral.500}` | Body text hierarchy                                 |
| `colors.components.text.middle`      | `{colors: semantics.neutral.700}` | Body text hierarchy                                 |
| `colors.components.text.high`        | `{colors: semantics.neutral.900}` | Body text hierarchy                                 |
| `colors.components.text.disabled`    | `{colors: semantics.neutral.500}` | Body text hierarchy                                 |
| `colors.components.text.placeholder` | `{colors: semantics.neutral.500}` | Body text hierarchy                                 |
| `colors.components.skeleton.fill`    | `{colors: semantics.neutral.200}` | Loading skeleton fill                               |
| `colors.components.ring.normal`      | `#096cdcff`                       | Focus ring / outline                                |


---

## 4. Typography

### 4.1 Primitives

#### Font Family


| Token                            | Value          |
| -------------------------------- | -------------- |
| `typography.font-family.mono`    | `BIZ UDGothic` |
| `typography.font-family.default` | `Noto Sans JP` |


#### Font Size


| Token                     | Value (px) |
| ------------------------- | ---------- |
| `typography.font-size.12` | `12px`     |
| `typography.font-size.14` | `14px`     |
| `typography.font-size.16` | `16px`     |
| `typography.font-size.18` | `18px`     |
| `typography.font-size.20` | `20px`     |
| `typography.font-size.24` | `24px`     |
| `typography.font-size.28` | `28px`     |
| `typography.font-size.32` | `32px`     |
| `typography.font-size.36` | `36px`     |
| `typography.font-size.42` | `42px`     |
| `typography.font-size.48` | `48px`     |
| `typography.font-size.54` | `54px`     |


#### Font Weight


| Token                           | Value |
| ------------------------------- | ----- |
| `typography.font-weight.normal` | `400` |
| `typography.font-weight.bold`   | `700` |
| `typography.font-weight.medium` | `500` |


#### Line Height


| Token                       | Value (px) |
| --------------------------- | ---------- |
| `typography.line-height.18` | `18px`     |
| `typography.line-height.20` | `20px`     |
| `typography.line-height.24` | `24px`     |
| `typography.line-height.28` | `28px`     |
| `typography.line-height.32` | `32px`     |
| `typography.line-height.36` | `36px`     |
| `typography.line-height.44` | `44px`     |
| `typography.line-height.48` | `48px`     |
| `typography.line-height.56` | `56px`     |
| `typography.line-height.64` | `64px`     |
| `typography.line-height.72` | `72px`     |
| `typography.line-height.84` | `84px`     |


#### Letter Spacing


| Token                              | Value (em) |
| ---------------------------------- | ---------- |
| `typography.letter-spacing.normal` | `0em`      |
| `typography.letter-spacing.wide`   | `0.02em`   |
| `typography.letter-spacing.wider`  | `0.05em`   |
| `typography.letter-spacing.widest` | `0.1em`    |


### 4.2 Text Styles (Composed)

Combined styles for direct application. Use these when assigning typography to UI elements.


| Style                     | Weight        | Size | Line Height | Usage hint                  |
| ------------------------- | ------------- | ---- | ----------- | --------------------------- |
| `font.display md.regular` | 400 (regular) | 36px | 44px        | Hero / page title           |
| `font.display md.medium`  | 500 (medium)  | 36px | 44px        | Hero / page title           |
| `font.display md.bold`    | 700 (bold)    | 36px | 44px        | Hero / page title           |
| `font.display sm.regular` | 400 (regular) | 32px | 36px        | Section header              |
| `font.display sm.medium`  | 500 (medium)  | 32px | 36px        | Section header              |
| `font.display sm.bold`    | 700 (bold)    | 32px | 36px        | Section header              |
| `font.display xs.regular` | 400 (regular) | 24px | 28px        | Sub-section / modal title   |
| `font.display xs.medium`  | 500 (medium)  | 24px | 28px        | Sub-section / modal title   |
| `font.display xs.bold`    | 700 (bold)    | 24px | 28px        | Sub-section / modal title   |
| `font.text xl.regular`    | 400 (regular) | 20px | 24px        | Card title, large body      |
| `font.text xl.medium`     | 500 (medium)  | 20px | 24px        | Card title, large body      |
| `font.text xl.bold`       | 700 (bold)    | 20px | 24px        | Card title, large body      |
| `font.text lg.regular`    | 400 (regular) | 18px | 24px        | Subheading, emphasized body |
| `font.text lg.medium`     | 500 (medium)  | 18px | 24px        | Subheading, emphasized body |
| `font.text lg.bold`       | 700 (bold)    | 18px | 24px        | Subheading, emphasized body |
| `font.text md.regular`    | 400 (regular) | 16px | 24px        | Default body text           |
| `font.text md.medium`     | 500 (medium)  | 16px | 24px        | Default body text           |
| `font.text md.bold`       | 700 (bold)    | 16px | 24px        | Default body text           |
| `font.text sm.regular`    | 400 (regular) | 14px | 20px        | Secondary body, labels      |
| `font.text sm.medium`     | 500 (medium)  | 14px | 20px        | Secondary body, labels      |
| `font.text sm.bold`       | 700 (bold)    | 14px | 20px        | Secondary body, labels      |
| `font.text xs.regular`    | 400 (regular) | 12px | 18px        | Caption, helper text, badge |
| `font.text xs.medium`     | 500 (medium)  | 12px | 18px        | Caption, helper text, badge |
| `font.text xs.bold`       | 700 (bold)    | 12px | 18px        | Caption, helper text, badge |


---

## 5. Border Radius

### 5.1 Primitives


| Token                                   | Value                 |
| --------------------------------------- | --------------------- |
| `borders.primitives.border-radius.none` | `0px`                 |
| `borders.primitives.border-radius.xs`   | `2px`                 |
| `borders.primitives.border-radius.sm`   | `4px`                 |
| `borders.primitives.border-radius.md`   | `6px`                 |
| `borders.primitives.border-radius.lg`   | `8px`                 |
| `borders.primitives.border-radius.xl`   | `12px`                |
| `borders.primitives.border-radius.2xl`  | `16px`                |
| `borders.primitives.border-radius.3xl`  | `24px`                |
| `borders.primitives.border-radius.full` | `9999px (full round)` |


### 5.2 Semantics

Apply these semantic tokens to components — not the raw primitives.


| Token                                       | Maps to                                    | Value    | Usage                                            |
| ------------------------------------------- | ------------------------------------------ | -------- | ------------------------------------------------ |
| `borders.semantics.border-radius.divide`    | `{borders: primitives.border-radius.none}` | `0px`    | Layout dividers (no radius)                      |
| `borders.semantics.border-radius.minimum`   | `{borders: primitives.border-radius.xs}`   | `2px`    | All non-divider elements minimum                 |
| `borders.semantics.border-radius.notice`    | `{borders: primitives.border-radius.sm}`   | `4px`    | System notification elements                     |
| `borders.semantics.border-radius.action`    | `{borders: primitives.border-radius.md}`   | `6px`    | Actionable / clickable elements (buttons, chips) |
| `borders.semantics.border-radius.halfmodal` | `{borders: primitives.border-radius.lg}`   | `8px`    | Bottom sheet / half modal                        |
| `borders.semantics.border-radius.modal`     | `{borders: primitives.border-radius.xl}`   | `12px`   | Full modal dialogs                               |
| `borders.semantics.border-radius.round`     | `{borders: primitives.border-radius.full}` | `9999px` | Pill badges, avatars, tags                       |


---

## 6. Spacing

Padding scale. Use for margin, padding, gap in layouts.


| Token                 | Value   |
| --------------------- | ------- |
| `spacing.padding.0`   | `0px`   |
| `spacing.padding.2`   | `2px`   |
| `spacing.padding.4`   | `4px`   |
| `spacing.padding.6`   | `6px`   |
| `spacing.padding.8`   | `8px`   |
| `spacing.padding.12`  | `12px`  |
| `spacing.padding.16`  | `16px`  |
| `spacing.padding.20`  | `20px`  |
| `spacing.padding.24`  | `24px`  |
| `spacing.padding.32`  | `32px`  |
| `spacing.padding.40`  | `40px`  |
| `spacing.padding.48`  | `48px`  |
| `spacing.padding.56`  | `56px`  |
| `spacing.padding.72`  | `72px`  |
| `spacing.padding.88`  | `88px`  |
| `spacing.padding.104` | `104px` |
| `spacing.padding.120` | `120px` |


---

## 7. Sizing (Max-width)

Max-width breakpoints for containers and modals.


| Token                  | Value    |
| ---------------------- | -------- |
| `sizing.max-width.xs`  | `320px`  |
| `sizing.max-width.sm`  | `384px`  |
| `sizing.max-width.md`  | `448px`  |
| `sizing.max-width.lg`  | `512px`  |
| `sizing.max-width.xl`  | `576px`  |
| `sizing.max-width.2xl` | `672px`  |
| `sizing.max-width.3xl` | `768px`  |
| `sizing.max-width.4xl` | `896px`  |
| `sizing.max-width.5xl` | `1024px` |
| `sizing.max-width.6xl` | `1152px` |
| `sizing.max-width.7xl` | `1280px` |


---

## 8. Effects (Box Shadow)


| Token                      | Color       | Offset X | Offset Y | Radius | Spread | Usage                          |
| -------------------------- | ----------- | -------- | -------- | ------ | ------ | ------------------------------ |
| `effect.box-shadow.base`   | `#000000ff` | `0`      | `0`      | `0`    | `0`    | No shadow (flat surface)       |
| `effect.box-shadow.flat`   | `#0000000d` | `0`      | `1`      | `0`    | `0`    | Subtle lift, 1px bottom tint   |
| `effect.box-shadow.raise`  | `#0000000d` | `0`      | `1`      | `2`    | `0`    | Card / raised surface          |
| `effect.box-shadow.stick`  | ``          | ``       | ``       | ``     | ``     | Sticky header / fixed element  |
| `effect.box-shadow.float`  | ``          | ``       | ``       | ``     | ``     | Floating UI (tooltip, popover) |
| `effect.box-shadow.popout` | ``          | ``       | ``       | ``     | ``     | Dropdown, modal, highest layer |


---

## 9. AI Usage Rules

When generating any UI or design spec for ESKitchen, follow these rules:

**Colors**

- Never use raw hex values. Always reference token names.
- Use `colors.components.*` for component-level color decisions.
- Use `colors.semantics.*` for state-driven color (error, success, warning...).
- Use `colors.primitives.*` only when defining new semantic/component tokens.

**Typography**

- Default font: `Noto Sans JP`. Mono/code font: `BIZ UDGothic`.
- Body default: `font.text md.regular` (16px / 24px line-height).
- Never invent a font size outside the defined scale.
- Apply weights via `typography.font-weight.*` tokens (400 / 500 / 700 only).

**Border Radius**

- Always apply via `borders.semantics.border-radius.*` — not raw primitives.
- Buttons, chips, inputs → `action` (6px)
- Modals → `modal` (12px)
- Bottom sheets → `halfmodal` (8px)
- Pill / badge / avatar → `round` (9999px)

**Spacing**

- Use only values from `spacing.padding.*` scale.
- Common gaps: 4, 8, 12, 16, 24, 32px.

**Elevation**

- Apply `effect.box-shadow.*` based on element layer:
  - Base content → `flat`
  - Cards → `raise`
  - Sticky bars → `stick`
  - Tooltips, popovers → `float`
  - Modals, dropdowns → `popout`

---

## 10. Per-Site Layout Rules

> Dùng section này khi Designer Agent tạo Figma cho từng app cụ thể.
> **[confirmed]** = đọc trực tiếp từ Figma. **[inferred]** = suy luận từ token system + site type.

---

### E03 — System Admin Web (`es-kitchen-web-admin`) [confirmed Figma + image]

**Color theme:** `colors.semantics.company.*` (blue — `#0969da`) — button primary, active states, links

**Viewport:** 1440 × 1024px (desktop)

**Layout structure:**
```
┌──────────┬────────────────────────────────────┐
│ Sidebar  │ Header (54px)                      │
│ 210px    ├────────────────────────────────────┤
│ (white,  │ Page Header: Breadcrumb + Title     │
│ accordion│ (94px: 20px top pad + 22px + 32px) │
│ nav)     ├────────────────────────────────────┤
│          │ Main Content (padding: 24px horiz) │
│          │ bg: colors.semantics.neutral.50    │
└──────────┴────────────────────────────────────┘
```

| Yếu tố | Giá trị |
|---|---|
| Sidebar width | **210px** |
| Header height | **54px** |
| Page header height | **94px** (breadcrumb 22px + title 32px + padding) |
| Content horizontal padding | **24px** |
| Content starts at | x=210, y=148 |
| Content area width | 1183px |
| Background | `colors.semantics.neutral.50` (#f6f8fa) |

**Navigation:** Left sidebar — expandable accordion, nhiều mục (ダッシュボード, メニュー管理, マスタ管理, 法人・契約管理, アカウント管理, 売上管理, 配送管理), màu trắng/light với text navy

**Common components (confirmed từ Figma metadata):**
- `Sidebar` — 210×1024, accordion nav, character mascot + hamburger ở bottom
- `Header` — 1231×54, ESSTATION logo + greeting + user profile
- `Breadcrumb` — 22px height, separator ">"
- Page title — `font.display xs.bold` (24px/700)
- Action buttons in header — **48px** height
- Table columns: row height **54px**, header row **55px**
- Table pagination — **48px** height, "100件 1-10件 | 1...N | 10件/ページ"
- Filter bar — **112px** height (search inputs + buttons)
- Table cell action column — **96px** width
- Collapsible section headers — accordion style với caret icon

**Screen naming convention:** `AW_<MODULE>_<SEQ>_<日本語>`

---

### E02 — Company Admin Web (`es-kitchen-web-company`) [confirmed from image]

**Color theme:** `colors.semantics.admin.*` (orange — `#FAA51D` = `colors.primitives.orange.400`) — button primary, active nav, badges

**Viewport:** 1440 × 1024px (desktop)

**Layout structure:**
```
┌──────────┬────────────────────────────────────┐
│ Sidebar  │ Header (~56px)                     │
│ ~180px   ├────────────────────────────────────┤
│ (white,  │ Breadcrumb + Page Title            │
│ simple   ├────────────────────────────────────┤
│ nav)     │ Stats Row (summary cards)          │
│          ├────────────────────────────────────┤
│          │ Filter Bar + Table + Pagination    │
└──────────┴────────────────────────────────────┘
```

| Yếu tố | Giá trị |
|---|---|
| Sidebar width | **~180px** (narrower hơn E03) |
| Header height | **~56px** |
| Content horizontal padding | **~24px** |
| Stats summary row | ~60px height |
| Table row height | ~54px (inferred same pattern) |
| Pagination | "100件 1-10件 | 1...N | 10件/ページ" |

**Navigation:** Left sidebar — ít mục hơn E03 (売上管理, ユーザー一覧...), character mascot + hamburger ở bottom

**Phân biệt với E03:**
- Orange accent (#FAA51D) thay vì blue
- Sidebar ít items hơn (58 functions vs 160)
- Có stats summary row (tổng KPIs) ở đầu content
- CSV export button ở top right (orange outline)
- Scope: chỉ quản lý company của mình

**Screen naming convention:** `CW_<MODULE>_<SEQ>_<日本語>` (inferred)

---

### E01 — User Mobile App (`es-kitchen-payment-app`) [confirmed from image]

**Color theme:** `colors.semantics.app.*` (yellow — `#FAC215` = `colors.primitives.yellow.400`) — primary button, badges, highlights

**Viewport:** 390 × 844px (iPhone 14 standard)

**Layout structure:**
```
┌──────────────────────┐
│ Status Bar (safe)    │  ~44px
├──────────────────────┤
│ Navigation Bar       │  ~56px (title + back button)
├──────────────────────┤
│                      │
│   Main Content       │  scroll vertical
│   (product cards,    │
│    cart items...)    │
│                      │
├──────────────────────┤
│ Action Bar / Button  │  ~56px (full-width CTA)
└──────────────────────┘
```

| Yếu tố | Giá trị |
|---|---|
| Screen width | 390px |
| Top nav bar | ~56px (title + back) |
| Content horizontal padding | 16px |
| Product card border radius | `borders.semantics.border-radius.halfmodal` (8px) |
| Primary button | Full width, yellow (#FAC215), border-radius `action` (6px) |
| Modal/bottom sheet | `borders.semantics.border-radius.modal` (12px) top corners |
| Cart item row height | ~72px (image 48px + padding) |

**Navigation:** Top nav bar (back + title). Modal overlay dùng bottom sheet pattern.

**Platform:** Flutter 3.x — sizing qua `flutter_screenutil`, không hard-code pixel

**Common patterns (từ ảnh):**
- Product list: thumbnail left + text right + quantity/price badge
- Cart: list items + total bar at bottom + action button
- Confirmation modal: centered overlay với character mascot, buttons stack vertical
- Quantity badge: yellow circle, `font.text xs.bold`

**Screen naming convention:** `APP_<MODULE>_<SEQ>_<日本語>` (inferred)

---

### E04 — Supplier Web (`es-kitchen-web-supplier`) [confirmed from image]

**Color theme:** `colors.primitives.purple.600` (`#6639BA`) — button primary, active nav highlight, status badges

> ⚠️ Purple không có trong `colors.semantics.*` table — dùng primitive trực tiếp: `colors.primitives.purple.600`

**Viewport:** 1440 × 1024px (desktop)

**Layout structure:**
```
┌──────────┬────────────────────────────────────┐
│ Sidebar  │ Header (~56px)                     │
│ ~120px   ├────────────────────────────────────┤
│ (white,  │ Breadcrumb + Page Title            │
│ minimal  ├────────────────────────────────────┤
│ 3 items) │ Filter Bar + Table + Pagination    │
└──────────┴────────────────────────────────────┘
```

| Yếu tố | Giá trị |
|---|---|
| Sidebar width | **~120px** (rất hẹp — chỉ text, không có icon riêng) |
| Header height | **~56px** |
| Content padding | **~24px** |
| Table row height | ~54px |
| Filter bar | date picker + dropdown + search button |
| Pagination | "100件 1-10件 | 1...N | 10件/ページ" |

**Navigation:** Left sidebar — chỉ 3-4 mục (TOP, 受注一覧, パスワード変更, その他), character mascot + hamburger ở bottom

**Screen naming convention:** `SW_<MODULE>_<SEQ>_<日本語>` (inferred)

---

### E05 — Outsource / Internal Private Web (`es-kitchen-web-outsource-web-private`) [confirmed from image]

**Color theme:** `#8ACA0D` (lime green) — button primary, active nav

> ⚠️ Lime green `#8ACA0D` **KHÔNG có trong token table** của ESKITCHEN. Khi tạo Figma cho E05, dùng giá trị hex trực tiếp hoặc tạo custom token `colors.primitives.green.outsource` = `#8ACA0D`. Cần confirm với design system owner.

**Viewport:** 1440 × 1024px (desktop)

**Layout structure:**
```
┌──────────┬────────────────────────────────────┐
│ Sidebar  │ Header (~56px)                     │
│ ~150px   ├────────────────────────────────────┤
│ (white,  │ Breadcrumb + Page Title            │
│ 3-4 items├────────────────────────────────────┤
│ )        │ Accordion Form Sections            │
└──────────┴────────────────────────────────────┘
```

| Yếu tố | Giá trị |
|---|---|
| Sidebar width | **~150px** |
| Header height | **~56px** |
| Content padding | **~24px** |
| Section header | collapsible accordion, caret icon |
| Form grid | 3-column cho info fields |

**Navigation:** Left sidebar — 3-4 mục (TOP, 配送状況, 集金額, スタッフ), character mascot + hamburger ở bottom

**Common patterns:** Accordion form sections, dropdown selects, date pickers, edit button top-right

**Screen naming convention:** `OW_<MODULE>_<SEQ>_<日本語>` (inferred)

---

### E06 — Driver Web App (`es-kitchen-webapp-driver`) [confirmed from image]

**Color theme:** `colors.semantics.company.*` (blue — `#0969DA`) — FAB button, active states, links

**Viewport:** ~390px mobile-optimized web (ReactJS, không phải native)

**Layout structure:**
```
┌──────────────────────┐
│ Top Header           │  ~56px (logo + greeting + user)
├──────────────────────┤
│                      │
│   Order Card List    │  scroll vertical
│   (delivery cards)   │
│                      │
│                 [FAB]│  floating action button, bottom-right
└──────────────────────┘
```

| Yếu tố | Giá trị |
|---|---|
| Screen width | ~390px |
| Top header | **~56px** (ESSTATION logo + greeting + profile) |
| Content padding | 16px |
| Order card | white card, `borders.semantics.border-radius.halfmodal` (8px) |
| FAB button | circle, blue (#0969DA), bottom-right fixed |

**Navigation:** Top header only — không có sidebar, không có bottom tab bar. Driver workflow là linear (nhận đơn → giao → confirm).

**Common patterns (từ ảnh):**
- Delivery cards: company name + date + status + product info
- 3-column layout trong card (thông tin giao hàng)
- FAB button: blue circle, trigger delivery action
- Completion dialog: overlay với character mascot + confirm button

**Stack:** React 19 / Ant Design — mobile-first CSS breakpoint

**Screen naming convention:** `DW_<MODULE>_<SEQ>_<日本語>` (inferred)

---

## 11. Figma → ESKITCHEN Token Quick Lookup (per site)

| Site | Primary button hex | ESKITCHEN token | Nguồn |
|---|---|---|---|
| E03 System Admin | `#0969DA` | `colors.semantics.company.500` | confirmed |
| E02 Company Admin | `#FAA51D` | `colors.primitives.orange.400` / `colors.semantics.admin.400` | confirmed |
| E01 Mobile App | `#FAC215` | `colors.primitives.yellow.400` / `colors.semantics.app.400` | confirmed |
| E04 Supplier | `#6639BA` | `colors.primitives.purple.600` | confirmed |
| E05 Outsource | `#8ACA0D` | **KHÔNG trong token table** — dùng hex trực tiếp | confirmed |
| E06 Driver | `#0969DA` | `colors.semantics.company.500` (same as E03) | confirmed |

> **Lưu ý quan trọng:** `colors.semantics.company.*` = blue → dùng cho **E03** (System Admin) và **E06** (Driver). `colors.semantics.admin.*` = orange → dùng cho **E02** (Company Admin). Mapping này ngược với tên token — đây là convention của ESKITCHEN design system.

**Shared error / success / warning** — tất cả sites:
| Intent | Token | Hex |
|---|---|---|
| Error / Destructive | `colors.semantics.negative.500` | `#cf222e` |
| Success / Confirm | `colors.semantics.success.400` | `#2da44e` |
| Warning | `colors.semantics.warning.400` | `#fac215` |
| Info | `colors.semantics.info.500` | `#0969da` |
| Text primary | `colors.components.text.high` | `#24292f` |
| Text secondary | `colors.components.text.middle` | `#424a53` |
| Text disabled | `colors.components.text.low` | `#6e7781` |
| Border default | `colors.components.divider.middle` | `#d0d7de` |
| Background page | `colors.semantics.neutral.50` | `#f6f8fa` |

