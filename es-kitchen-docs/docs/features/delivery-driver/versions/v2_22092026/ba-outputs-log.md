# BA Outputs Log — v2 · 22/09/2026

> Feature: **App Tài Xế — Driver Mobile Web (E06 Phase 2)** · Backlog ESKITCHEN-1238
> Nguồn: Figma section `DA - update` (`16422:114492`), page `Driver Moblie Web (P2)_review 可`

## Bảng status outputs

| # | Output | Status | Path / URL | Note |
|---|---|---|---|---|
| 0 | `SPEC.md` (17 sections) | ✅ Done | `features/delivery-driver/SPEC.md` | 1985 dòng · 28 màn chính + 18 màn phụ = 46 màn · 34 Open Question |
| 1 | Figma Output 1 — Flow Tổng Quan + Technology Table + Sitemap WBS | ✅ Done | [node 32099:49634](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=32099-49634) | 2280×3216 · 8 business flow · gap 100px · overlap 0 |
| 2 | Figma Output 2 — Screen Flow (Merged Branch) | ✅ Done | [node 32105:49624](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=32105-49624) | 3600×5396 · 8 Group + Master Map + Combined Detail + bảng ④⑤⑦ · overlap 0 |
| 3 | Figma Output 3 — Screens + Items | ❌ Skipped | — | User quyết định. Figma gốc `DA - update` đã có 95 mockup + 48 bảng item song ngữ chi tiết hơn |
| 4 | HTML Prototype | ❌ Skipped | — | User quyết định. Figma gốc đóng vai trò prototype |

## Diff so với v1 (25/06/2026)

| Hạng mục | v1 (25/06/2026) | v2 (22/09/2026) |
|---|---|---|
| Nguồn | Domain stories / function list (không bám Figma) | **100% Figma `DA - update`**: 95 frame · 48 bảng mô tả · 54 connector · 16 flow note |
| Screen Code | `DA_DRVR_001`–`011` (BA tự đặt, 11 màn) | **Screen code thật của Figma**: `DA_AUTHEN_*` · `DA_HOME_*` · `DA_NOTI_*` · `DA_LIST_*` · `DA_RECV_*` · `DA_ESDL_*` · `DA_COOL_*` · `DA_RPTD_*` (46 màn) |
| Số màn | 11 | **46** (28 chính + 18 phụ) |
| Sections | 10 | **17** (thêm BA Deliverables · Source Register · Quy tắc trạng thái & quyền sửa · UX Review Notes · Open Questions) |
| Non-Happy | Không có bảng 4 cột | **260 dòng** bảng 8 nhóm/screen: 14 ĐẾM · 68 STATE · 106 UNKNOWN · 72 N/A |
| Validation / message | Không có | Đầy đủ message thật tiếng Nhật từ 48 bảng Figma |
| Quy trình trưng bày ES配送便 | Mô tả 1 câu | **5 bước chi tiết** + 2 màn kết quả + tab 陳列情報 + 駐車報告 (7 ngày sửa lại) |
| Quy tắc tách tag mới khi hoàn thành một phần | Không có | Có (kho + COOL便) — nguồn connector `18578:41563` · `18870:187993` |
| Open Questions | Không có | **34 OQ**, trong đó 5 BLOCKING/CONFLICT |
| Chức năng bị loại | — | HubSpot chat widget (`DA_DRVR_011` ở v1) **không có trong Figma** → OQ-33 |

## Quyết định chốt trong lần chạy này

| ID | Quyết định |
|---|---|
| DEC-01 | Dùng **screen code Figma** thay code tự đặt ở v1. v1 giữ nguyên tại `versions/v1_25062026/SPEC.md` |
| DEC-02 | Diễn giải nghiệp vụ **tiếng Việt**, text hiển thị user **giữ nguyên tiếng Nhật** trong 「」 |
| DEC-03 | Chỉ vẽ **Output 1 + Output 2**; Output 3 + HTML Prototype skip theo yêu cầu user |
| DEC-04 | SPEC gộp về **1 file `SPEC.md`** (bỏ hướng tách 4 file theo cụm đã thử giữa buổi) |

## Quality Gate

| Gate | Kết quả | Bằng chứng |
|---|---|---|
| O1 — overlap bbox | ✅ PASS | `overlapCount = 0` / 136 block node (script quét toạ độ, không nhìn mắt) |
| O1 — gap giữa flow band | ✅ PASS | 7 gap đều = **100px** (yêu cầu MIN 100) |
| O1 — đủ 3 phần | ✅ PASS | Phần A (8 flow band) · Phần B (Technology Table 10 dòng + Merge Log) · Phần C (Sitemap WBS 14 hành động) |
| O1 — Sitemap không mất mục | ✅ PASS | 10 Hành động của Driver ≥ 10 candidate thô trong Flow Candidate Matrix |
| O2 — overlap bbox | ✅ PASS | `overlapCount = 0` / 351 block node (sau khi dedupe 5 arrowhead trùng toạ độ) |
| O2 — số Group = N business flow | ✅ PASS | 8 Group = 8 flow ở Output 1 |
| O2 — gap giữa Group | ✅ PASS | gap nhỏ nhất **382px** (yêu cầu MIN 150) |
| O2 — connector thật | ✅ PASS | Mọi node nối bằng arrow vẽ thật (rect + polygon arrowhead), không phải chip rời rạc |
| O2 — bảng ⑦ = 100% error display | ✅ PASS | 82 dòng `D-001…D-082` = 82 dòng ĐẾM+STATE đếm bằng script trên SPEC.md |
| O2 — thống kê tổng khớp SPEC | ✅ PASS | Figma ghi 46 màn = block thống kê `## Screens` (28 + 18) |
| O2 — text tràn frame | ✅ PASS | 0 text node vượt biên |
| O2 — số NG node ≥ số Non-Happy Case | ⚠️ **Needs Revision — giải quyết bằng thiết kế** | Vẽ 46 node NG/E-xx trên sơ đồ < 188 dòng Non-Happy trong SPEC. Lý do: 106 dòng là `UNKNOWN` (Figma không định nghĩa hành vi → không có gì để vẽ) và 72 dòng là `N/A`. 82 dòng có hành vi cụ thể được liệt kê **đủ 100%** ở bảng ⑦ + 34 `OQ` ở bảng ⑤ — đúng cơ chế mà `output-2-screen-flow.md` §⑦ đặt ra để thay cho việc vẽ hàng trăm NG node. **Ghi nhận công khai, không báo PASS.** |

## Feedback

_(để trống — chờ user review)_
