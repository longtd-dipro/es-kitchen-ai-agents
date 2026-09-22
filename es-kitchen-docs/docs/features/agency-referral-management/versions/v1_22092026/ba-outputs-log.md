# BA Outputs Log — v1_22092026

> Feature: `agency-referral-management` · Ngày: 2026-09-22 · BA run #1

## Trạng thái 5 outputs

| # | Output | Status | Path / URL | Note |
|---|---|---|---|---|
| 0 | SPEC.md | ✅ Done | `../../SPEC.md` | 14 sections + Open Questions + UX Review + Phụ lục A. 24 screen detail block. |
| 1 | Figma — Flow Tổng Quan | ✅ Done | node `32110:403829` | 4 business flow + Sitemap WBS 21 hành động. Technology Table bỏ trống có chủ đích. |
| 2 | Figma — Screen Flow | ✅ Done | node `32119:174894` | 4 group + ④ Screen Index 24 · ⑤ Exception Matrix 10 · ⑥ Terminal 11 · ⑦ Error/Popup Index 74 · ⑧ Error-Screen Strip 8. |
| 3 | Figma — Screens + Items | ❌ Skipped | — | User quyết định: Figma nguồn đã có 17 mockup high-fi + 31 bảng item spec JP/VN. |
| 4 | HTML Prototype | ❌ Skipped | — | User yêu cầu chỉ SPEC.md + Output 1 + Output 2. |

## Quyết định của user trong run này (2026-09-22)

1. **ID conflict** — tạo SPEC mới ở folder riêng, **giữ nguyên** `agency-management/SPEC.md` + 125 TC (PR #43). Bộ TC cũ đánh dấu `STALE`, QC quyết định thời điểm regenerate. Mapping cũ↔mới ở `## Phụ lục A`.
2. **Scope** — cả 4 module (`AW_FEPL` · `AW_AGCY` · `AW_REFE` · `AW_FEPA`).
3. **Figma output** — ban đầu chọn "không vẽ thêm", sau đó đổi thành **chỉ vẽ Output 1 + Output 2**.
4. **Ngôn ngữ** — tiếng Việt, giữ nguyên thuật ngữ JP gốc trong ngoặc.

## Quality Gate

- Bước 5.5 — bbox overlap scan bằng script: `overlapCount = 0` trên **cả 2 frame** (O1: 66 block · O2: 195 block). Không kết luận bằng mắt.
- Cross-verify: N flow Output 1 (4) = N group Output 2 (4) ✅
- Cross-verify: tổng screen Output 2 Bảng Index (24) = số block `## Screen Details` trong SPEC (24) ✅
- Cross-verify: số dòng bảng ⑦ (74) = số error display `E-001…E-074` trong SPEC (74) ✅
- Sitemap: 21 mục Hành động ≥ 20 candidate thô trong Flow Candidate Matrix ✅ (rule "gộp = đổi tầng")

## Diff so với version trước

Không có — đây là version đầu tiên của feature này.

## Feedback

_(để trống — chờ user review)_
