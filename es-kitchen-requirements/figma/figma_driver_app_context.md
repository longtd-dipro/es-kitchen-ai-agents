# Tóm tắt Frame Figma DA — Driver App Context

> **Frame ID:** `16422:114492` · **Prefix:** `DA_` (Driver App — `es-kitchen-webapp-driver`)

---

## 1. Layout Structure

Đây không phải 1 màn hình — là **section tổng** (7742 × 18604px) chứa khoảng **~50 mobile screens** (390×844, iPhone size) xếp thành nhiều hàng/section theo flow.

---

## 2. Các Nhóm Màn Hình

| Group | Screens | Mục đích |
|---|---|---|
| `DA_AUTHEN_*` | 001, 002_01→06 | Login + OTP/verify flow |
| `DA_HOME_*` | 001, 001-01/02, 002, 003, 005 | Home dashboard driver |
| `DA_RECV_*` | 001, 001-02, 001-3, 003 | Nhận đơn (có popup confirm) |
| `DA_DLVR_*` | 001 (7 variants), 002 (3), 003 (5), 004 (2), 005 (2) | Flow giao hàng + cập nhật trạng thái |
| `DA_RPTD_*` | 001-01 → 001-5 | Report / báo cáo sau giao |
| `DA_CHAT_001` | 1 | Chatbox với khách / điều phối |
| `DA_NOTI_*` | 001, 002 | Notification list + detail |

---

## 3. Components Tái Sử Dụng

Các component lặp lại trong các screen:

- **Header** (390×64) + **Status Container** (390×72)
- **Pop up** (342×566) — popup confirm có Image + Message + Description + Checkbox + 2–3 Button
- Button, Checkbox, Input with Title, Image Upload, Inline Message
- Delivery Info, Delivery List Header, Delivery Summary Container, Delivery Items Container
- Feature Icon, Inspection Status Container, Job Title Container, Login Form, Chatbox
- **Tab / Horizontal** (bottom tab điều hướng)

---

## 4. Color Tokens

### Company (Primary)

| Token | Hex |
|---|---|
| `company/50` | `#e5f6ff` |
| `company/100` | `#ceedff` |
| `company/400` | `#218bff` |
| `company/500` | `#0969da` |
| `company/600` | `#0550ae` |

### Admin (Accent — Vàng)

| Token | Hex |
|---|---|
| `admin/50` | `#fff9eb` |
| `admin/300` | `#fbc14e` |
| `admin/500` | `#f4860c` |

### Semantic Colors

| Nhóm | Token | Hex |
|---|---|---|
| **Success** | `success/50` | `#edfdf0` |
| | `success/100` | `#c5f7d0` |
| | `success/400` | `#2da44e` |
| | `success/500` | `#1a7f37` |
| | `green/600` | `#116329` |
| **Warning** | `warning/100` | `#fef0c3` |
| | `warning/500` | `#eab308` |
| | `warning/600` | `#ca9a04` |
| **Negative** | `negative/500` | `#cf222e` |
| **Info** | `info/50` | `#e5f6ff` |
| | `info/400` | `#218bff` |
| | `info/500` | `#0969da` |

### Neutral / Text / Background

| Token | Hex |
|---|---|
| `text/high` | `#24292f` |
| `text/middle` | `#424a53` |
| `text/low` | `#6e7781` |
| `text/placeholder/disabled` | `#6e7781` |
| `neutral/50` | `#f6f8fa` |
| `neutral/700` | `#424a53` |
| `divider/low` | `#eaeef2` |
| `divider/middle` | `#d0d7de` |
| `divider/high` | `#afb8c1` |
| `bg` | `#fafafa` |
| `layout_bg` | `#f3f4f6` |
| `primary_bg` | `#fff6f5` |
| `white` | `#ffffff` |

### Extra

| Token | Hex |
|---|---|
| `Link` | `#1480FF` |
| `Mint White Blue` | `#63B4FF` |
| `Stroke` | `#D9D9D9` |
| `Character/Disable` | `#BFBFBF` |

---

## 5. Typography

- **Font chính:** Noto Sans JP (mặc định toàn app)
- **Icon font:** Material Symbols Rounded (size 20 & 24)
- **Letter-spacing:** mặc định `0`; biến thể `-pro` dùng `letter-spacing: 5` (cho tiếng Nhật)

### Type Scale

| Style | Size / Line Height |
|---|---|
| Display xs / Bold | 24 / 28 |
| Text xl / Medium | 20 / 24 |
| Text lg / Bold, Medium | 18 / 24 |
| Text md / Bold, Medium, Regular | 16 / 24 |
| Text sm / Medium, Regular | 14 / 20–22 |
| Text xs / Bold, Medium, Regular | 12 / 18–20 |

---

## 6. Spacing & Radius

### Padding Tokens

`0` · `2` · `4` · `6` · `8` · `12` · `16` · `20` · `24`

### Border Radius

| Token | Value |
|---|---|
| `xs` | 2px |
| `notice` | 4px |
| `action` | 6px |
| `Radius/8` | 8px |
| `round/full` | 9999px |

### Shadows

`box-shadow/raise` · `stick` · `float` · `Modal` · `Neutral outline button` · `md` · `drop-shadow/0.15`

---

## 7. Text Content & Slots

Các text slot chuẩn xuất hiện xuyên suốt các màn hình:

- Status message · Status detail
- Message · Description
- Job Title · Delivery Info
- Order code · Customer name · Address · Time · Note
- Confirm / Cancel button text

> **Ghi chú:** Nội dung literal bằng tiếng Việt / Nhật khá dày. File metadata ~210KB — nếu cần extract chi tiết từng màn hình, cần focus vào 1 screen cụ thể.
