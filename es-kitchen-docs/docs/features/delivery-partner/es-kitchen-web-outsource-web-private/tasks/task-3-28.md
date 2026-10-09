# [FE] [Delivery_Web] — Đồng bộ menu điều hướng theo IA mới

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — Common
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 4h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | task-3-26 (làm **sau cùng** để QC chỉ cập nhật tài liệu 1 lần) |
| Song song với | task-3-27 |
| Estimate | ~4h |

## Mục tiêu
Đổi nhãn + thứ tự menu sidebar cho khớp component `sider` của Figma, và chuyển `パスワード変更` vào menu người dùng ở header.

## Context (đọc trước khi code)

### 🎨 Figma
- **Component:** `sider` · node **`31498:194809`** — 7 mục + trạng thái thu gọn icon-only
- Thứ tự: ホーム · スケジュール · 配送管理 · 見積もり管理 · 集金・駐車 · 配送スタッフ · プロフィール

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → **§3 bảng đối chiếu nhãn**, FE-00, §8 R4

### 📂 File liên quan
- `src/constants/nav.ts` — nhãn hiện tại: `TOP` · `プロフィール` · `注文リスト` · `スケジュール` · `配送状況` · `集金額` · `スタッフ` · `パスワード変更`
- `src/layouts/AuthLayout.tsx` — sidebar + header

## Yêu cầu implement

### Step 3 — `constants/nav.ts` + `AuthLayout.tsx`
| Thứ tự | Nhãn mới | Route | Ghi chú |
|---|---|---|---|
| 1 | `ホーム` | `/dashboard` | đổi từ `TOP` |
| 2 | `スケジュール` | `/schedule` | giữ |
| 3 | `配送管理` | `/delivery-status` | đổi từ `配送状況` |
| 4 | `見積もり管理` | `/orders` | đổi từ `注文リスト` — ⚠️ **[PENDING Q7]**, nếu chưa có trả lời thì **giữ nhãn cũ** và ghi chú |
| 5 | `集金・駐車` | `/collection-reports` | đổi từ `集金額` |
| 6 | `配送スタッフ` | `/driver` | đổi từ `スタッフ` |
| 7 | `プロフィール` | `/profile` | chuyển xuống cuối |
| — | `パスワード変更` | `/change-password` | **bỏ khỏi sidebar**, đưa vào dropdown avatar ở header (giữ nguyên route) |

- Giữ trạng thái thu gọn icon-only đã có
- Không đổi `key` của NavItem nếu key đang được dùng để active route — kiểm tra trước

## Unit Tests (BẮT BUỘC)
```typescript
it('renders the 7 nav items in the Figma order', ...);
it('does not render パスワード変更 in the sidebar', ...);
it('exposes パスワード変更 in the header user menu', ...);
it('highlights the active item for the current route', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage nav`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Mọi mục menu dẫn tới đúng màn
- [ ] Trạng thái active đúng khi ở route con (vd `/driver/123`)
- [ ] Đổi mật khẩu vẫn vào được từ header

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Điều hướng toàn app | `src/routes/` | Không route nào bị mất |
| **Tài liệu QC** | — | ⚠️ Đổi nhãn menu làm lệch test case/manual đang dùng nhãn cũ — **báo QC trước khi merge** (§8 R4) |

## Không được làm
- Không đổi đường dẫn route (chỉ đổi nhãn + thứ tự)
- Không đổi nhãn mục 見積もり管理 khi Q7 chưa được trả lời

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Đã thông báo QC về danh sách nhãn thay đổi
- [ ] Integration check pass · Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
