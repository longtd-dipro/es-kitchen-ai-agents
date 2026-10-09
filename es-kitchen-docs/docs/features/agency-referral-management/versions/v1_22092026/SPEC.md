# SPEC: Quản lý Đại lý & Giới thiệu (Agency & Referral Management)

> Domain: `dai-ly` · EPIC ID: 03 (System Admin) · Repo: `es-kitchen-web-admin` + `es-kitchen-api`
> Target Actor: **E03 — System Admin**
> Phase: Phase 2
> Cross-repo: Single-actor (E03 + API) — Contract Lock **không bắt buộc** trước Phase 3
> Nguồn: **100% trích từ Figma** — file `ES-Kitchen-phase-2`, page `Admin Web (P2)_review 可`, section `Quản lý Đại lý (Agency & Partner)` (node `29419:267328`)
> Ngày tạo: 2026-09-22 · Version: v1

---

> ## ⚠️ Quan hệ với SPEC `agency-management` (đọc trước khi dùng)
>
> SPEC này **KHÔNG thay thế** `es-kitchen-docs/docs/features/agency-management/SPEC.md`.
>
> | | `agency-management` (cũ) | `agency-referral-management` (SPEC này) |
> |---|---|---|
> | Nguồn | `markerting_daily_function_list.xlsx` (sheet `BF_ ĐẠI LÝ`) | Figma `Quản lý Đại lý (Agency & Partner)` |
> | Screen code | `AW_AGCY_001`–`AW_AGCY_013` (1 prefix) | `AW_FEPL` · `AW_AGCY` · `AW_REFE` · `AW_FEPA` (4 prefix) |
> | Test case | **125 TC đã merge (PR #43)** trace về 11 AC + 13 screen code của SPEC cũ | Chưa có TC |
> | Trạng thái | **GIỮ NGUYÊN** — không sửa, không đánh số lại | Mới |
>
> **Quyết định của user (2026-09-22):** tạo SPEC mới ở folder riêng, giữ nguyên SPEC cũ + 125 TC để không phá traceability. Bộ 125 TC hiện được đánh dấu **`STALE`** so với Figma — QC quyết định thời điểm regenerate, BA **không** tự sửa.
>
> Bảng mapping screen code cũ → mới: xem `## Phụ lục A — Mapping SPEC cũ ↔ SPEC mới` ở cuối file.

---

## Mô tả nghiệp vụ

Hệ thống cho phép **System Admin** quản lý toàn bộ vòng đời giới thiệu khách hàng và chi trả phí giới thiệu, thông qua menu sidebar **`代理・紹介管理` (Quản lý Đại lý & Giới thiệu)** gồm **4 module**:

1. **`紹介フィーマスタ` — Master Phí giới thiệu (`AW_FEPL`)**
   Khai báo các gói phí giới thiệu (Referral Fee Plan): phân loại nguồn giới thiệu (pháp nhân / đại lý), phân loại thanh toán (một lần / liên tục theo tháng / liên tục vĩnh viễn), phương pháp tính (số tiền cố định / số tiền theo lần cung cấp hàng tháng / tỷ lệ trên số tiền yêu cầu thanh toán), kỳ hạn thanh toán và trạng thái hiệu lực.

2. **`代理店マスタ` — Master Đại lý (`AW_AGCY`)**
   Quản lý hồ sơ đại lý: thông tin pháp lý và địa chỉ, gói phí giới thiệu được gán, danh sách người phụ trách (Main admin / Sub admin). Màn chi tiết & chỉnh sửa có 3 tab: Lịch sử giới thiệu · Lịch sử thanh toán · Lịch sử thay đổi.

3. **`紹介履歴` — Lịch sử giới thiệu (`AW_REFE`)**
   Ghi nhận từng hồ sơ giới thiệu: nguồn giới thiệu (đại lý hoặc pháp nhân) → hợp đồng được giới thiệu → pháp nhân/chi nhánh tương ứng, kèm gói phí áp dụng, năm tháng bắt đầu hợp đồng và năm tháng bắt đầu thanh toán. Mỗi hợp đồng chỉ được đăng ký **1** lịch sử giới thiệu.

4. **`支払履歴` — Lịch sử thanh toán phí (`AW_FEPA`)**
   Bản ghi chi trả phí giới thiệu theo tháng, **do batch hệ thống sinh** (Tháng đối tượng thanh toán = tháng chạy batch). Admin cập nhật Phương thức xử lý · Số tiền điều chỉnh · Tình trạng thanh toán · Ngày thanh toán. Không có chức năng tạo mới / xóa thủ công.

**Quan hệ dữ liệu giữa 4 module (theo Figma):**

```
AW_FEPL (Master phí giới thiệu)
   │ được gán cho
   ├──────────────► AW_AGCY (Master đại lý)  ── section 2 "紹介フィープラン"
   │                    │ là nguồn giới thiệu của
   │                    ▼
   └──────────────► AW_REFE (Lịch sử giới thiệu) ── section 2 "Gói phí giới thiệu"
                        │ batch tính phí theo tháng
                        ▼
                    AW_FEPA (Lịch sử thanh toán phí) ── section 3 "Chi tiết phí giới thiệu"
```

---

## BA Deliverables

> Entry point bắt buộc cho downstream (Tech Lead / Designer / QC). Đọc section này **trước** `## Actors & Preconditions`.

| # | Output | Status | Path / URL | Note |
|---|---|---|---|---|
| 0 | `SPEC.md` (14 sections) | ✅ Done | `es-kitchen-docs/docs/features/agency-referral-management/SPEC.md` | 100% trích Figma |
| 1 | Figma Frame — Flow Tổng Quan | ✅ Done | [`32110:403829`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=32110-403829) | 4 business flow (ACTOR→TRIGGER→FUNCTION→OUTCOME) + Sitemap WBS 21 hành động. **Không có Technology Table** — `TECH_STACK` chưa được user confirm, không tự bịa |
| 2 | Figma Frame — Screen Flow | ✅ Done | [`32119:174894`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=32119-174894) | 4 group (24 node có connector thật) + ④ Screen Index 24 · ⑤ Exception Matrix 10 · ⑥ Terminal 11 · ⑦ Error/Popup Index 74 · ⑧ Error-Screen Strip |
| 3 | Figma Frame — Screens + Items | ❌ Skipped | — | User quyết định (2026-09-22): Figma nguồn **đã có sẵn** 17 mockup high-fi + 31 bảng item spec song ngữ JP/VN chi tiết hơn output kit. Vẽ lại = trùng lặp |
| 4 | HTML Prototype | ❌ Skipped | — | User yêu cầu chỉ tạo SPEC.md + Output 1 + Output 2 |

**Figma nguồn (design thật — dùng cái này để code, không dùng frame BA vẽ):**

| Module | Screens | Figma node |
|---|---|---|
| `AW_FEPL` | 001 list · 002 create · 003 edit · 004 detail | `29419:271225` · `29419:271321` · `29419:271404` · `29419:271499` |
| `AW_AGCY` | 001 list · 002 create · 003 edit · 004 detail | `29419:269792` · `29419:270424` · `29419:267329` · `29419:267332` |
| `AW_REFE` | 001 list · 002 create · 003 edit(agency) · 004 edit(company) · 005 detail | `29419:269959` · `29419:270966` · `29419:271019` · `29419:271141` · `29419:271080` |
| `AW_FEPA` | 001 list · 002 edit(đại lý) · 003 edit(company) · 004 detail | `29419:267914` · `29419:268381` · `29419:268853` · `29419:269325` |

Base URL: `https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=<node-id>`

**Downstream instructions:**

- **Tech Lead Design** — dùng `## Screen Details` (item + validation + error message thật) làm nguồn cho DB schema và API contract. Lưu ý 4 module = 4 nhóm entity, `AW_FEPA` là **batch-generated**, không có API create/delete.
- **Designer** — **KHÔNG cần vẽ lại**. 17 màn high-fi đã tồn tại trong Figma nguồn; điền URL ở bảng trên vào cột `Figma Link` của `## Screens`.
- **QC** — sinh TC từ `## Screen Details` + `## Acceptance Criteria` của SPEC này. **Không** trộn với 125 TC của `agency-management` (khác bộ ID).

---

## Source Register

> Mọi statement trong SPEC này trace về 1 row dưới. `FACT` = có trong Figma (đã đọc trực tiếp); `UNKNOWN` = Figma ghi rõ `要確認` / `cần xác nhận`; `CONFLICT` = Figma tự mâu thuẫn. **Không có row `INFERENCE` nào được nối vào Happy Path / AC** — theo yêu cầu user "100% figma, không tự động thêm".

| ID | Statement | Classification | Evidence | Confidence | Used in flow? |
|---|---|---|---|---|---|
| RQ-001 | Sidebar `代理・紹介管理` gồm 4 mục: 紹介フィーマスタ / 代理店マスタ / 紹介履歴 / 支払履歴 | FACT | Screenshot `29419:269792` + `29419:267332` (sidebar) | High | Yes — Sitemap Output 1 |
| RQ-002 | Fee Plan ID định dạng `RFP` + 6 chữ số, hệ thống tự sinh | FACT | Table `30033:237981` row L.2 | High | Yes — AW_FEPL_001 |
| RQ-003 | Agency ID định dạng `AG` + 5 chữ số | FACT | Table `30079:156427` row 1.2 | High | Yes — AW_AGCY_001 |
| RQ-004 | Referral ID định dạng `REF` + 6 chữ số | FACT | Table `30177:167135` row 2.2 | High | Yes — AW_REFE_001 |
| RQ-005 | Payment ID định dạng `FP` + `yyyymm` + `-` + 4 chữ số | FACT | Table `30148:165790` row L.3 | High | Yes — AW_FEPA_001 |
| RQ-006 | Pháp nhân ID `CU` + 6 chữ số; Hợp đồng ID `CP` + 6 chữ số | FACT | Table `30177:167135` row 2.5, 2.7 | High | Yes — AW_REFE_001 |
| RQ-007 | 紹介元区分 có 2 giá trị: 法人 (pháp nhân) / 代理店 (đại lý) | FACT | Table `30033:237981` row L.4 | High | Yes |
| RQ-008 | 支払区分 ở Master phí có 3 giá trị: Một lần / Liên tục (theo tháng) / Liên tục (vĩnh viễn) | FACT | Table `30062:155318` row 2.1 | High | Yes |
| RQ-009 | 算定方法 có 3 giá trị: Số tiền cố định / Số tiền theo lần cung cấp hàng tháng / Tỷ lệ trên số tiền yêu cầu thanh toán | FACT | Table `30062:155318` row 2.3 | High | Yes |
| RQ-010 | Panel 2.4/2.5/2.6 hiển thị loại trừ theo 算定方法; khi chuyển thì xóa giá trị panel bị ẩn | FACT | Table `30062:155318` row 2.3 + `30062:156138`/`155319`/`155320` | High | Yes |
| RQ-011 | Fee Plan đang được tham chiếu (master đại lý / lịch sử giới thiệu / lịch sử thanh toán) thì **không xóa được** | FACT | Table `30033:237981` row L.12 | High | Yes — AC-04 |
| RQ-012 | Fee Plan `無効` bị loại khỏi lựa chọn khi liên kết mới, nhưng không ảnh hưởng dữ liệu đã liên kết | FACT | Table `30033:237981` row L.9 + `30062:155318` row 1.4 | High | Yes — AC-03 |
| RQ-013 | Dropdown gói phí ở màn Đăng ký đại lý chỉ hiển thị gói có Trạng thái = Hiệu lực **VÀ** Phân loại nguồn = Giới thiệu từ đại lý | FACT | Table `30092:158965` row 2.1 | High | Yes — AC-06 |
| RQ-014 | Mỗi đại lý chỉ đăng ký được **duy nhất 1 Main admin** | FACT | Table `30092:158965` row 3.1 | High | Yes — AC-07 |
| RQ-015 | Email người phụ trách không được trùng trong cùng 1 đại lý | FACT | Table `30092:158965` row 3.4 | High | Yes — AC-07 |
| RQ-016 | Dòng Main admin không thể xóa; icon xóa chỉ active với Sub admin; xóa dòng **không** có dialog xác nhận | FACT | Table `30092:158965` row 3.6 | High | Yes |
| RQ-017 | Nhập mã bưu điện 7 số → tự điền Tỉnh/Thành phố・Quận/Huyện・Khu vực; mã không tồn tại thì không điền và **không báo lỗi** | FACT | Table `30092:158964` row 1.7 | High | Yes — AC-05 |
| RQ-018 | Tên đại lý (Katakana) tự động sinh khi mất focus ở ô Tên đại lý, vẫn cho sửa tay | FACT | Table `30092:158964` row 1.3 | High | Yes |
| RQ-019 | Mỗi hợp đồng chỉ đăng ký được **1** lịch sử giới thiệu; dropdown chỉ hiện hợp đồng Hiệu lực & chưa liên kết | FACT | Table `30101:161875` row 1.5 | High | Yes — AC-09 |
| RQ-020 | Chọn ID hợp đồng → tự điền Pháp nhân được giới thiệu (1.6) + Chi nhánh được giới thiệu (1.7), read-only | FACT | Table `30101:161875` row 1.5–1.7 | High | Yes — AC-09 |
| RQ-021 | Năm tháng bắt đầu thanh toán **≧** Năm tháng bắt đầu hợp đồng | FACT | Table `30101:161875` row 1.9 | High | Yes — AC-10 |
| RQ-022 | Phân loại nguồn = Đại lý → enable 1.3 (Đại lý), disable+clear 1.4; và ngược lại | FACT | Table `30101:161875` row 1.2–1.4 | High | Yes — AC-09 |
| RQ-023 | Lịch sử giới thiệu **không xóa được** khi ① Trạng thái = Đang trong hợp đồng, hoặc ② đã phát sinh Lịch sử thanh toán | FACT | Table `30177:167135` row 2.16 | High | Yes — AC-11 |
| RQ-024 | Trạng thái lịch sử giới thiệu có đúng 3 giá trị: Đang trong hợp đồng / Đã hoàn thành / Hủy giữa chừng | FACT | Table `30177:167135` row 2.1(ステータス) + `30101:160272` row A-1.7 | High | Yes |
| RQ-025 | Lịch sử thanh toán do **batch** sinh; Tháng đối tượng thanh toán = Tháng chạy batch | FACT | Table `30148:165789` row S.6 + `30134:163792` row 1.2 | High | Yes — Flow |
| RQ-026 | Tình trạng thanh toán có 3 giá trị: Chưa thanh toán / Đã thanh toán / Ngoài đối tượng; giá trị ban đầu khi batch sinh = Chưa thanh toán | FACT | Table `30134:163792` row 2.1 | High | Yes — AC-13 |
| RQ-027 | Đổi Tình trạng sang "Đã thanh toán" → hệ thống tự set Ngày thanh toán = ngày hiện tại, admin vẫn sửa được | FACT | Table `30148:165790` row L.12 + `30134:163792` row 2.2 | High | Yes — AC-13 |
| RQ-028 | Phương thức xử lý: Chuyển khoản / Khấu trừ hóa đơn. Batch set mặc định: Pháp nhân → Khấu trừ hóa đơn, Đại lý → Chuyển khoản. Admin đổi được | FACT | Table `30134:163792` row 2.3 + `30148:165790` row L.6 | High | Yes — AC-12 |
| RQ-029 | Trong bảng Chi tiết phí giới thiệu, **chỉ** cột Số tiền điều chỉnh nhập được; không thêm/xóa/sắp xếp dòng | FACT | Table `30134:163793` row 3 + 3.11 | High | Yes — AC-14 |
| RQ-030 | Số tiền điều chỉnh: phạm vi −9.999.999 ~ 9.999.999, số nguyên, half-width; chỉ sửa được khi Tình trạng = Chưa thanh toán | FACT | Table `30134:163793` row 3.11 | High | Yes — AC-14 |
| RQ-031 | Tổng số tiền chi trả = Tổng số tiền tính toán + Tổng số tiền điều chỉnh, tính lại **real-time** | FACT | Table `30134:163792` row 2.7 + `30134:163793` row 3.12 | High | Yes — AC-14 |
| RQ-032 | Không sửa được lịch sử thanh toán đã ở trạng thái Đã thanh toán | FACT | Table `30148:165790` row L.13 (validation + error message) | High | Yes — AC-12 |
| RQ-033 | Tab Lịch sử giới thiệu & Tab Lịch sử thanh toán trong màn đại lý là **read-only**, không có cột thao tác; 0 bản ghi → "表示するデータがありません。" | FACT | Table `30101:160272` row A/A-1 + `30101:160836` row B/B-1 | High | Yes — AC-08 |
| RQ-034 | Bảng lịch sử thay đổi 3 cột (Thời điểm / Nội dung / Người thay đổi), read-only, sắp xếp mới nhất trước | FACT | Table `29710:244372` row B–B.3 | High | Yes — AC-08 |
| RQ-035 | Đại lý đang được tham chiếu trong Lịch sử giới thiệu hoặc Lịch sử thanh toán thì **không xóa được** | FACT | Table `30079:156427` row 1.11 | High | Yes — AC-08 |
| RQ-036 | Phân trang mặc định 10 dòng/trang; hiển thị "{Tổng số}件中 {Từ}−{Đến}件" | FACT | Table `30033:237982` row P.1–P.3 | High | Yes |
| RQ-037 | Nút Create/Update/Delete chỉ hiển thị với người dùng có quyền tương ứng | FACT | Table `30101:160634` row H.4–H.7 + `30033:237981` row H.1/L.11/L.12 | High | Yes — AC-01 |
| RQ-038 | Popup `編集破棄` hiện khi rời màn chỉnh sửa có thay đổi chưa lưu, qua nút Hủy / menu bên / breadcrumb | FACT | Table `30062:156208` row E–E.2 | High | Yes — AC-02 |
| RQ-039 | Popup `削除確認` nội dung "Bạn có chắc chắn muốn xóa không? Sau khi xóa sẽ không thể khôi phục." | FACT | Table `30073:156305` row D–D.2 | High | Yes — AC-02 |
| RQ-040 | Số tiền phí cố định: chỉ half-width, tối đa 7 chữ số, tự thêm dấu phẩy 3 chữ số khi mất focus | FACT | Table `30062:156138` row 2.4.1 | High | Yes — AC-05 |
| RQ-041 | Bảng bậc số lượng: cận dưới dòng N+1 tự điền = cận trên dòng N + 1; chỉ dòng cuối được để trống cận trên; tối thiểu 1 dòng | FACT | Table `30062:155319` row 2.5.2/2.5.3/2.5.5/2.5.6 | High | Yes — AC-05 |
| RQ-042 | Xử lý số lẻ: Làm tròn xuống (mặc định) / 5 lên 4 xuống / Làm tròn lên, áp dụng theo đơn vị yên trên kết quả `số tiền yêu cầu × tỷ lệ ÷ 100` | FACT | Table `30062:155320` row 2.6.2 | High | Yes — AC-05 |
| RQ-043 | Tìm kiếm ở AW_REFE_001 là khớp một phần trên 5 trường (Tên/ID đại lý, Tên/ID pháp nhân, ID giới thiệu), điều kiện OR | FACT | Table `30177:167134` row S.1 | High | Yes — AC-09 |
| RQ-044 | Tìm kiếm ở AW_FEPA_001 khớp một phần trên 2 trường (Tên bên nhận thanh toán, ID thanh toán), điều kiện OR | FACT | Table `30148:165789` row S.1 | High | Yes — AC-12 |
| RQ-045 | Sắp xếp AW_FEPA_001 mặc định: Tháng đối tượng thanh toán – giảm dần; sau khi sắp xếp về trang 1 | FACT | Table `30148:165789` row S.9 | High | Yes |
| RQ-046 | Nút Lưu bị vô hiệu hóa trong khi đang lưu; lưu xong hiện toast "Đã lưu." | FACT | Table `30101:160634` row H.6 + `30101:161875` row H.3 | High | Yes — AC-02 |
| RQ-047 | `AW_FEPA_002` lưu xong **giữ nguyên** tại màn chỉnh sửa (khác với màn khác là quay về danh sách) | FACT | Table `30134:163792` row H.7 | High | Yes — AC-12 |
| RQ-048 | Số thứ tự `No` đánh liên tục xuyên trang (trang 2 bắt đầu No.11) | FACT | Table `30148:165790` row L.1, `30177:167135` row 2.1 | Medium | Yes — nhưng xem OQ-01 |
| OQ-01 | `No` có thực sự đánh liên tục xuyên trang không | UNKNOWN | Figma ghi `（要確認）` tại `30033:237981` L.1 và `30079:156427` 1.1 | — | No — Open Question |
| OQ-02 | Danh sách lựa chọn của dropdown "Số dòng/trang" | UNKNOWN | Figma: "Danh sách lựa chọn cần xác nhận" (`30033:237982` P.3) | — | No |
| OQ-03 | Nút `CSV出力` ở `AW_AGCY_001` là **xuất** hay **nhập** CSV | CONFLICT | Nhãn nút = `CSV出力` (xuất) nhưng mô tả = "Tải lên file CSV để đăng ký・cập nhật dữ liệu hàng loạt" (nhập) — `30079:156426` H.8 | — | No — blocking |
| OQ-04 | Điều kiện hiển thị nút `CSV出力` ở `AW_REFE_001` và `AW_FEPA_001` | UNKNOWN | Figma ghi "Cần xác nhận" (`30177:167134` H.8, `30148:165789` H.3) | — | No |
| OQ-05 | Bản ghi đại lý đã xóa có hiển thị trong danh sách không | UNKNOWN | Figma: "việc có hiển thị bản ghi đã xóa trong danh sách hay không: cần xác nhận" (`30079:156427` 1.9) | — | No |
| OQ-06 | Khóa sắp xếp của `AW_AGCY_001` | UNKNOWN | Figma ghi "(đề xuất / cần xác nhận)" (`30079:156426` S.6) | — | No |
| OQ-07 | Filter `支払区分` (2 giá trị) có đồng bộ với Master phí (3 giá trị) không | UNKNOWN | Figma: "cần xác nhận: có đồng bộ với 3 giá trị … hay không" (`30177:167134` S.3) | — | No |
| OQ-08 | Định nghĩa hệ thống mã gói phí hiển thị dạng `{mã}：{tên gói}` (VD `B：代理店紹介`) | UNKNOWN | Figma: "(cần xác nhận: định nghĩa hệ thống mã)" (`30101:160272` A-1.5) | — | No |
| OQ-09 | `算定合計額` là đã gồm thuế hay chưa gồm thuế | UNKNOWN | Figma: "Phân loại thuế (đã gồm/chưa gồm thuế): cần xác nhận" (`30148:165790` L.8) | — | No |
| OQ-10 | Cách cập nhật trạng thái sau khi kỳ hạn thanh toán (VD 36 tháng) mãn hạn; công thức `有効紹介数 = 紹介合計数 − ① − ②` | UNKNOWN | Text node `29419:271727` trong Figma | — | No |
| OQ-11 | Khi chuyển Phân loại nguồn giới thiệu, gói phí ở section 2 của `AW_REFE_002` có bị xóa không | UNKNOWN | Figma: "(cần xác nhận)" (`30101:161875` 2.1) | — | No |
| OQ-12 | Nhãn panel 2.6 trong mockup hiển thị sai `月次提供回の金額`, đúng phải là `請求額割合` | CONFLICT | Figma ghi rõ: "実装バグとして修正が必要" (`30062:155320` 2.6) | — | No — cần sửa design |
| OQ-13 | Giá trị MAX của Đối tượng chi trả (100 ký tự) và các ngưỡng số tiền | UNKNOWN | Figma đánh dấu `（提案／要確認）` (`30134:163792` 1.4, `30134:163793` 3.8/3.10/3.11) | — | No |

**Quy ước áp dụng:** chỉ row `FACT` được đưa vào `## Happy Path` và `## Acceptance Criteria`. Toàn bộ `UNKNOWN` / `CONFLICT` tập trung ở `## Open Questions`, **không** nối vào flow bằng giả định.

---

## Actors & Preconditions

| Actor | Repo liên quan | Quyền cần có |
|---|---|---|
| **E03 — System Admin** | `es-kitchen-web-admin` + `es-kitchen-api` | Đăng nhập thành công · Role System Admin · quyền chi tiết theo bảng dưới |
| **System (Batch)** | `es-kitchen-api` | Actor hệ thống — sinh bản ghi `AW_FEPA` hàng tháng (RQ-025) |

**Ma trận quyền (theo RQ-037 — Figma `30101:160634` H.4–H.7):**

| Quyền | Hành vi UI khi **không** có quyền |
|---|---|
| `Create` | Ẩn nút `＋新規登録` (AW_FEPL_001, AW_AGCY_001, AW_REFE_001) |
| `Update` | Ẩn icon bút chì ở dòng danh sách + ẩn nút `編集` ở màn chi tiết + ẩn nút `Lưu` ở màn chỉnh sửa |
| `Delete` | Ẩn icon thùng rác ở dòng danh sách + ẩn nút `削除` ở màn chi tiết |

> ⚠️ Figma ghi tại `30033:237981` H.1: *"Chỉ người có quyền đăng ký (ẩn hay disable: cần xác nhận)"* → cách hiển thị **ẩn** vs **disable** chưa chốt, xem OQ.

**Preconditions:**

- System Admin đã xác thực (JWT hợp lệ).
- `AW_AGCY_002` yêu cầu đã tồn tại ít nhất 1 Fee Plan có Trạng thái = Hiệu lực và Phân loại nguồn = Giới thiệu từ đại lý (RQ-013).
- `AW_REFE_002` yêu cầu đã tồn tại hợp đồng ở trạng thái Hiệu lực và **chưa** liên kết lịch sử giới thiệu nào (RQ-019).
- `AW_FEPA_*` yêu cầu batch đã chạy sinh bản ghi cho tháng tương ứng (RQ-025) — **không có đường tạo thủ công**.

**Dependencies với domain khác (theo master được tham chiếu trong Figma):**

- **Master pháp nhân** — `AW_REFE_002` row 1.4 tham chiếu động, lọc Trạng thái = Hiệu lực.
- **Master hợp đồng** — `AW_REFE_002` row 1.5 tham chiếu động; cung cấp luôn Pháp nhân + Chi nhánh.
- **Master chi nhánh** — link "Chi tiết chi nhánh" từ `AW_REFE_001` / tab Lịch sử giới thiệu / `AW_FEPA_002`.
- **Dữ liệu số tiền yêu cầu thanh toán (請求額)** — `AW_FEPA_002` row 3.8 "Số tiền đối tượng tính" là cơ sở tính phí.

---

## Flow Tổng Quan

**Flow 1 — Thiết lập Master phí giới thiệu (`AW_FEPL`)**

```
System Admin → Sidebar 紹介フィーマスタ → AW_FEPL_001 (Danh sách)
   → [＋新規登録] → AW_FEPL_002 (Đăng ký)
        → chọn 算定方法 → panel tương ứng (固定額 / 月次提供回 / 請求額割合)
        → [登録] → [validation OK]  → Toast hoàn tất → AW_FEPL_001
                 → [validation NG]  → Inline error tại field lỗi
        → [キャンセル] → [đã nhập] → AW_FEPL_006 編集破棄 → [廃棄] → AW_FEPL_001
                                                          → [キャンセル] → AW_FEPL_002
   → click Fee Plan ID → AW_FEPL_004 (Chi tiết) → [編集] → AW_FEPL_003 (Chỉnh sửa)
   → icon 🗑 → AW_FEPL_005 削除確認 → [削除] → [không bị tham chiếu] → Toast "削除が完了しました。"
                                             → [đang bị tham chiếu] → Toast lỗi, không xóa
```

**Flow 2 — Quản lý Master đại lý (`AW_AGCY`)**

```
System Admin → Sidebar 代理店マスタ → AW_AGCY_001 (Danh sách)
   → [検索 / クリア / 並べ替え] → AW_AGCY_001 (cập nhật danh sách)
   → [＋新規登録] → AW_AGCY_002 (Đăng ký)
        → nhập 郵便番号 (7 số) → tự điền 都道府県・市区町村・町域
        → chọn 紹介フィープラン → tự điền 支払区分・算定方式・金額/率・支払期間 (read-only)
        → thêm dòng 担当者 (1 Main + N Sub)
        → [登録] → [OK] → Toast hoàn tất → AW_AGCY_001
                 → [Main trùng]     → Inline error "メイン担当者は1名のみ登録できます。"
                 → [Email trùng]    → Inline error "このメールアドレスは既に登録されています。"
   → click 代理店ID → AW_AGCY_004 (Chi tiết)
        → Tab 紹介履歴 / 支払履歴 / 変更履歴 (đều read-only)
        → [編集] → AW_AGCY_003 (Chỉnh sửa) → [保存] → Toast "Đã lưu." → AW_AGCY_004
                                            → [キャンセル + có thay đổi] → AW_AGCY_006 編集破棄
        → [削除] → AW_AGCY_005 削除確認 → [đang bị tham chiếu] → Toast "この代理店は使用されているため削除できません。"
```

**Flow 3 — Đăng ký & quản lý Lịch sử giới thiệu (`AW_REFE`)**

```
System Admin → Sidebar 紹介履歴 → AW_REFE_001 (Danh sách)
   → [＋新規登録] → AW_REFE_002 (Đăng ký)
        → chọn 紹介元区分 = 代理店 → enable dropdown 代理店, disable+clear 法人
                              = 法人   → enable dropdown 法人,   disable+clear 代理店
        → chọn 紹介先契約ID (chỉ hợp đồng Hiệu lực & chưa liên kết)
             → tự điền 紹介先法人 + 紹介先拠点 (read-only)
        → chọn 契約開始年月 + 支払い開始年月 (≧ 契約開始年月)
        → [登録] → [OK] → Toast hoàn tất → AW_REFE_001
                 → [契約ID đã dùng] → Inline error "この契約IDは既に紹介履歴に登録されています。"
                 → [支払 < 契約]    → Inline error "支払い開始年月は契約開始年月以降の年月を選択してください。"
   → click 紹介ID → AW_REFE_005 (Chi tiết)
   → icon ✏ → [nguồn = 代理店] → AW_REFE_003 (Edit from Agency)
             → [nguồn = 法人]   → AW_REFE_004 (Edit from other company)
   → icon 🗑 → AW_REFE_006 削除確認 → [Trạng thái = 契約中]        → Toast lỗi, không xóa
                                    → [đã có 支払履歴]            → Toast lỗi, không xóa
                                    → [còn lại]                  → Toast "削除が完了しました。"
```

**Flow 4 — Chi trả phí giới thiệu (`AW_FEPA`) — khởi nguồn từ System, không phải Admin**

```
System (Batch hàng tháng)
   → tính phí từng 紹介履歴 theo 紹介フィープラン áp dụng
   → sinh bản ghi 支払履歴 (支払対象月 = tháng chạy batch, 支払状況 = 未払い)
   → set 処理方法 mặc định: 支払先区分 = 法人 → 請求相殺 / = 代理店 → 振込

System Admin → Sidebar 支払履歴 → AW_FEPA_001 (Danh sách)
   → [検索 / 並べ替え (mặc định 支払対象月 giảm dần)] → AW_FEPA_001
   → click 支払いID → AW_FEPA_004 (Chi tiết)
   → icon ✏ → [支払状況 = 支払済み] → Toast "支払済みの支払履歴は編集できません。" (chặn)
             → [支払状況 = 未払い]
                  → [支払先区分 = 代理店] → AW_FEPA_002 (Edit đại lý)
                  → [支払先区分 = 法人]   → AW_FEPA_003 (Edit company)
                       → nhập 調整額 từng dòng → real-time cập nhật 調整合計額 + 支払合計額
                       → chọn 支払状況 = 支払済み → tự set 支払日 = hôm nay
                       → [保存] → Toast hoàn tất → GIỮ NGUYÊN tại màn chỉnh sửa (RQ-047)
                       → [キャンセル + có thay đổi] → AW_FEPA_005 編集破棄
```

---

## Happy Path

### Story 1 — Xem danh sách Master phí giới thiệu (`AW_FEPL_001`)

1. System Admin chọn `紹介フィーマスタ` trên sidebar.
2. Hệ thống hiển thị bảng danh sách gồm: No · フィープランID · フィープラン名 · 紹介元区分 · 支払区分 · 算定方式 · フィー金額・率 · 支払期間 · 状態 · 最終更新日 · thao tác (✏ / 🗑).
3. Cột `フィー金額・率` hiển thị theo `算定方式`: 固定額 → `33,000円` · 請求額割合 → `10%` · プラン別 → văn bản cố định `プラン別設定`.
4. Cột `支払期間`: 支払区分 = 単発 → cố định `1回`; = 連続 → `36ヶ月` hoặc `永続`.
5. Phân trang hiển thị `{Tổng số}件中 {Từ}−{Đến}件`, mặc định 10 dòng/trang.

### Story 2 — Đăng ký Fee Plan mới (`AW_FEPL_002`)

1. System Admin nhấn `＋新規登録`.
2. Hệ thống mở màn Đăng ký với 2 section accordion (mặc định mở): `紹介フィー情報` và `フィー条件`.
3. Admin nhập `フィープラン名`, chọn `紹介元区分` (mặc định 法人) và `ステータス` (mặc định 有効), nhập `備考` (tùy chọn).
4. Admin chọn `支払区分`:
   - `単発` hoặc `継続（永続）` → ô `支払い期間（ヶ月）` bị xóa giá trị và disable.
   - `継続（ヶ月）` → ô `支払い期間（ヶ月）` được enable và trở thành bắt buộc.
5. Admin chọn `算定方法` (mặc định 固定額) → panel tương ứng hiển thị, panel cũ bị ẩn và xóa giá trị:
   - `固定額` → panel 2.4: nhập `フィー金額（円）税込`.
   - `月次提供回の金額` → panel 2.5: bảng bậc số lượng, tối thiểu 1 dòng.
   - `請求額割合` → panel 2.6: nhập `フィー率（%）` + chọn `端数処理` (mặc định 切り捨て).
6. Admin nhấn `登録`. Hệ thống validate toàn bộ, tạo bản ghi, sinh `フィープランID` dạng `RFP` + 6 số.
7. Hệ thống chuyển về `AW_FEPL_001` và hiển thị toast hoàn tất.

### Story 3 — Xem chi tiết / chỉnh sửa / xóa Fee Plan (`AW_FEPL_004` · `AW_FEPL_003` · `AW_FEPL_005`)

1. Admin click `フィープランID` (text link) → `AW_FEPL_004` Chi tiết.
2. Màn chi tiết hiển thị toàn bộ item ở chế độ read-only + bảng `変更情報テーブル` (3 cột, mới nhất trước).
3. Admin nhấn `編集` (chỉ hiện với quyền Update) → `AW_FEPL_003`.
4. Admin sửa và nhấn `保存` → hệ thống lấy lại dữ liệu mới nhất, cập nhật màn hình, hiển thị toast `Đã lưu.`; nút bị disable trong lúc lưu.
5. Admin nhấn icon 🗑 → `AW_FEPL_005` popup xác nhận xóa → `削除` → xóa thành công, toast `削除が完了しました。`.

### Story 4 — Xem danh sách & tìm kiếm Master đại lý (`AW_AGCY_001`)

1. System Admin chọn `代理店マスタ` trên sidebar.
2. Hệ thống hiển thị bảng: No · 代理店ID · 代理店名 · 紹介フィープラン · メイン担当者名 · 紹介合計数 · 支払対象数 · 現在契約中 · ステータス · thao tác.
3. Ba chỉ số được hệ thống tự tổng hợp:
   - `紹介合計数` — đếm **tất cả** hồ sơ giới thiệu đã đăng ký, bất kể trạng thái.
   - `支払対象数` — chỉ đếm hồ sơ có hợp đồng chính thức đang hiệu lực **VÀ** kỳ hạn thanh toán của gói phí chưa hết hạn.
   - `現在契約中` — chỉ đếm hồ sơ mà công ty/chi nhánh liên quan hiện có hợp đồng chính thức active.
4. `ステータス` hiển thị dạng badge: 有効 = xanh lá, 無効 = đỏ.
5. Admin dùng khu vực tìm kiếm: text (khớp một phần theo ID・tên đại lý) · dropdown `紹介フィープラン` · dropdown `ステータス` → nhấn `検索`; nhấn `クリア` để xóa toàn bộ điều kiện.

### Story 5 — Đăng ký đại lý mới (`AW_AGCY_002`)

1. Admin nhấn `＋新規登録` → màn Đăng ký đại lý (màn riêng).
2. **Section 1 — 代理店情報:** nhập `代理店名` (≤50), hệ thống tự sinh `代理店名カナ` khi mất focus (vẫn sửa được); chọn `ステータス` (mặc định 有効); nhập `電話番号` (bắt buộc), `FAX番号` (tùy chọn).
3. Admin nhập `郵便番号` 7 số → khi mất focus hệ thống tự điền `都道府県` · `市区町村` · `町域・番地`; các ô này vẫn sửa tay được. Nhập thêm `建物・部屋番号` (tùy chọn), `備考` (tùy chọn, ≤255).
4. **Section 2 — 紹介フィープラン:** Admin chọn `紹介フィープラン` từ dropdown (chỉ gói 有効 + 紹介元区分 = 代理店紹介). Hệ thống tự điền read-only: `フィー支払区分` · `フィー算定方式` · `フィー金額・率` · `フィー支払期間`. Đổi gói → 4 ô tự cập nhật lại.
5. **Section 3 — 担当者:** Admin thêm dòng người phụ trách; mỗi dòng gồm `区分` (Main/Sub) · `担当者名` · `フリガナ` (tự sinh) · `メールアドレス` · `TEL`. Chỉ được 1 Main admin. Nút `行を追加` thêm dòng trống lên đầu bảng.
6. Admin nhấn `登録` → validate toàn bộ → tạo bản ghi, sinh `代理店ID` dạng `AG` + 5 số → quay về `AW_AGCY_001` + toast hoàn tất.

### Story 6 — Xem chi tiết đại lý với 3 tab (`AW_AGCY_004`)

1. Admin click `代理店ID` → màn `代理店情報詳細 {AG_ID}`.
2. Phần trên hiển thị read-only 3 section: `代理店情報` · `紹介フィープラン` · `担当者` (bảng 区分/担当者名/フリガナ/メールアドレス/TEL).
3. Phần dưới là bộ 3 tab:
   - **`紹介履歴`** — bảng read-only: No · 紹介ID (link) · 法人 · 拠点名 (link) · 紹介フィープラン · 支払区分 · ステータス · 算定方式 · 開始月 · 終了予定月 · 終了月. Không có cột thao tác.
   - **`支払履歴`** — bảng read-only: No · 支払対象月 · 支払いID (link) · 支払先区分 · 支払先 · 対象件数 · 算定額 · 調整額 · 支払合計額 · 支払状況 · 支払日. Không có dòng tổng cộng.
   - **`変更履歴`** — bảng 3 cột: 変更日時 (`YYYY/MM/DD HH:mm`) · 変更内容 · 変更者.
4. Khi tab không có bản ghi → hiển thị `表示するデータがありません。`.
5. Admin nhấn `編集` → `AW_AGCY_003`; nhấn `削除` → `AW_AGCY_005`.

### Story 7 — Xem danh sách & lọc Lịch sử giới thiệu (`AW_REFE_001`)

1. System Admin chọn `紹介履歴` trên sidebar.
2. Hệ thống hiển thị bảng: No · 紹介ID (link) · 紹介元 · 紹介元区分 · 紹介先法人ID-法人名 · 拠点名 · 契約ID (link) · 紹介フィープラン · 支払区分 · ステータス · フィー算定方式 · 開始月 · 終了予定月 · 終了月 · thao tác.
3. Khu vực lọc gồm: text search (5 trường, OR) · `紹介フィープラン` · `支払区分` · `ステータス` · `フィー算定方式` · `開始月` (month picker) · `終了月` (month picker) · nút `クリア` · `検索` · `並べ替え`.
4. Cột `終了予定月` để trống nghĩa là Liên tục (vĩnh viễn) — không có dự kiến kết thúc.
5. Cột `終了月` để trống nghĩa là hợp đồng đang tiếp diễn; trường hợp hủy giữa chừng thì giá trị sớm hơn `終了予定月`.

### Story 8 — Đăng ký lịch sử giới thiệu (`AW_REFE_002`)

1. Admin nhấn `＋新規登録` → màn Đăng ký lịch sử giới thiệu.
2. **Section 1 — Thông tin cơ bản giới thiệu:** Admin chọn `紹介元区分` (mặc định 代理店).
   - Chọn `代理店` → dropdown `代理店` enable (chỉ đại lý 有効); dropdown `法人` bị xóa giá trị + disable.
   - Chọn `法人` → ngược lại.
3. Khi chọn đại lý, gói phí giới thiệu đã đăng ký của đại lý đó **tự động phản ánh** vào Section 2.
4. Admin chọn `紹介先契約ID` — dropdown chỉ liệt kê hợp đồng thỏa mãn: ① Trạng thái hợp đồng = Hiệu lực ② chưa được liên kết với lịch sử giới thiệu nào.
5. Hệ thống tự điền read-only `紹介先法人ID・法人名` và `紹介先拠点ID・拠点名`. Đổi hợp đồng → 2 ô tự lấy lại và ghi đè.
6. Admin chọn `契約開始年月` và `支払い開始年月` (month picker, `yyyy年mm月`); ràng buộc `支払い開始年月 ≧ 契約開始年月`. Nhập `備考` (tùy chọn).
7. **Section 2 — Gói phí giới thiệu:** hiển thị read-only `紹介フィープラン` · `フィー支払区分` · `フィー算定方式` · `フィー金額・率` · `フィー支払期間`. `フィー支払期間` chỉ hiển thị khi 支払区分 = 継続（ヶ月）và được dùng để tính `終了予定月`.
8. Admin nhấn `登録` → validate toàn bộ → sinh `紹介ID` dạng `REF` + 6 số → quay về `AW_REFE_001` + toast hoàn tất.

### Story 9 — Chỉnh sửa / xem chi tiết lịch sử giới thiệu (`AW_REFE_003` · `AW_REFE_004` · `AW_REFE_005`)

1. Admin click `紹介ID` → `AW_REFE_005` Chi tiết (read-only + `変更情報テーブル`).
2. Admin nhấn icon ✏ → hệ thống mở màn chỉnh sửa tương ứng theo `紹介元区分`:
   - `代理店` → `AW_REFE_003` (Edit giới thiệu — from Agency).
   - `法人` → `AW_REFE_004` (Edit giới thiệu — from other company).
3. Admin sửa, nhấn `保存` → toast `Đã lưu.`; nút disable trong lúc lưu.

### Story 10 — System sinh lịch sử thanh toán hàng tháng (`AW_FEPA`, actor = System)

1. Batch chạy theo tháng. `支払対象月` = tháng chạy batch.
2. Với mỗi hồ sơ giới thiệu thuộc đối tượng tính phí trong tháng đó, hệ thống tính `算定額` theo `算定方式` của gói phí đang áp dụng.
3. Hệ thống sinh bản ghi `支払履歴`, cấp `支払いID` dạng `FP` + `yyyymm` + `-` + 4 số tuần tự.
4. Giá trị khởi tạo: `支払状況` = `未払い`; `調整額` = `0円`; `支払日` = trống.
5. `処理方法` được set mặc định theo `支払先区分`: `法人` → `請求相殺` (Khấu trừ hóa đơn); `代理店` → `振込` (Chuyển khoản).

### Story 11 — Xem danh sách thanh toán phí (`AW_FEPA_001`)

1. System Admin chọn `支払履歴` trên sidebar.
2. Hệ thống hiển thị bảng: No · 支払対象月 · 支払いID (link) · 支払先区分 · 支払先 · 処理方法 · 対象件数 · 算定合計額 · 調整合計額 · 支払合計額 · 支払状況 · 支払日 · thao tác (✏).
3. `支払合計額` = `算定合計額` + `調整合計額`. Nếu không có điều chỉnh, `調整合計額` hiển thị `0円`.
4. Khu vực lọc: text search (支払先名 / 支払いID, OR) · `紹介フィープラン` · `支払区分` · `支払状況` · `フィー算定方式` · `支払対象月` (month picker) · `クリア` · `検索` · `並べ替え`.
5. `並べ替え` mặc định `支払対象月` giảm dần; sau khi sắp xếp hệ thống hiển thị trang 1.

### Story 12 — Chỉnh sửa thanh toán phí (`AW_FEPA_002` / `AW_FEPA_003`)

1. Admin nhấn icon ✏ trên dòng có `支払状況 = 未払い` → màn chỉnh sửa (đại lý hoặc company tùy `支払先区分`).
2. **Section 1 — Thông tin cơ bản thanh toán (read-only):** `支払いID` · `支払対象月` (`yyyy年MM月`) · `支払先区分` · `支払先` · `対象件数`.
3. **Section 2 — Phí giới thiệu:** Admin chọn `支払状況` (3 lựa chọn); chọn `処理方法` (振込 / 請求相殺); nhập `備考` (tùy chọn).
   - Đổi `支払状況` = `支払済み` → hệ thống tự set `支払日` = ngày hiện tại (admin sửa lại được).
   - `支払状況` = `対象外` → ô `支払日` bị ẩn.
4. Bốn thẻ tổng hợp read-only tự tính: `算定対象額合計` · `算定合計額` · `調整合計額` · `支払合計額` (nhấn mạnh màu xanh).
5. **Section 3 — 紹介フィー内訳 (accordion, mặc định mở):** mỗi dòng = 1 hồ sơ giới thiệu được tính phí trong tháng, gồm No · 紹介ID (link) · 紹介先法人 · 拠点名 (link) · 紹介フィープラン · 支払区分 · 算定方式 · 算定対象額 · フィー金額・率 · 算定額 · **調整額 (ô duy nhất nhập được)** · 支払額.
6. Admin nhập `調整額` (cho phép số âm) → hệ thống tính lại **real-time** `支払額` của dòng đó, đồng thời `調整合計額` và `支払合計額` ở Section 2.
7. Admin nhấn `保存` → lưu, lấy lại dữ liệu mới nhất, hiển thị toast hoàn tất và **giữ nguyên tại màn chỉnh sửa** (không quay về danh sách).

### Story 13 — Xem chi tiết thanh toán phí (`AW_FEPA_004`)

1. Admin click `支払いID` từ `AW_FEPA_001` hoặc từ tab `支払履歴` của `AW_AGCY_004`.
2. Hệ thống hiển thị toàn bộ nội dung Section 1–3 ở chế độ read-only, kèm `変更情報テーブル`.
3. Admin nhấn `編集` (nếu có quyền Update và `支払状況 = 未払い`) → màn chỉnh sửa tương ứng.

---

## Alternative Flows & Edge Cases

> Toàn bộ mục dưới đây trích trực tiếp từ cột `詳細` / `バリデーション` / `エラーメッセージ` của bảng spec trong Figma. Không có mục nào do BA suy luận thêm.

### A. Ràng buộc xóa (delete guard)

| Đối tượng | Điều kiện chặn xóa | Nguồn |
|---|---|---|
| Fee Plan (`AW_FEPL`) | Đang được tham chiếu từ master đại lý · lịch sử giới thiệu · lịch sử thanh toán | `30033:237981` L.12 |
| Đại lý (`AW_AGCY`) | Đang được tham chiếu trong Lịch sử giới thiệu hoặc Lịch sử thanh toán | `30079:156427` 1.11 |
| Lịch sử giới thiệu (`AW_REFE`) | ① Trạng thái = 契約中 (Đang trong hợp đồng) **hoặc** ② đã phát sinh Lịch sử thanh toán | `30177:167135` 2.16 |
| Người phụ trách Main admin | Không xóa được (icon disable); chỉ Sub admin xóa được | `30092:158965` 3.6 |
| Dòng bậc số lượng (panel 2.5) | Không xóa khi chỉ còn 1 dòng | `30062:155319` 2.5.5 |
| Lịch sử thanh toán (`AW_FEPA`) | **Không có chức năng xóa** — bản ghi do batch sinh | Figma không có icon 🗑 ở `30148:165790` |

### B. Ràng buộc chỉnh sửa

- `AW_FEPA_*`: bản ghi có `支払状況 = 支払済み` **không chỉnh sửa được** → toast `支払済みの支払履歴は編集できません。` (`30148:165790` L.13).
- `AW_FEPA_002/003` — cột `調整額` bị disable khi `支払状況` = `支払済み` hoặc `対象外` (`30134:163793` 3.11).
- `AW_FEPL_001` — các cột `紹介元区分` · `支払区分` · `算定方式` · `フィー金額・率` · `支払期間` · `状態` chỉ sửa được ở màn chi tiết/chỉnh sửa, không sửa trực tiếp trên danh sách (`30033:237981` L.4–L.9).
- `備考` ở `AW_AGCY`: màn chi tiết = Chỉ đọc, màn chỉnh sửa = Text (`30092:158964` 1.12).

### C. Hành vi liên động (dependent field)

| Trigger | Kết quả | Nguồn |
|---|---|---|
| `支払区分` ≠ `継続（ヶ月）` | Ô `支払い期間（ヶ月）` bị xóa giá trị + disable (xám) | `30062:155318` 2.1 / 2.2 |
| Đổi `算定方法` | Panel cũ bị ẩn **và xóa giá trị**; panel mới hiển thị | `30062:155318` 2.3 |
| Đổi `紹介フィープラン` ở `AW_AGCY_002` | 4 ô read-only 2.2–2.5 tự lấy lại và ghi đè | `30092:158965` 2.1 |
| Chưa chọn `紹介フィープラン` | 4 ô 2.2–2.5 ở trạng thái disabled | `30092:158965` 2.2–2.5 |
| `支払区分` = Một lần / Liên tục vĩnh viễn | Ô `フィー支払期間` không hiển thị giá trị + disable | `30092:158965` 2.5 |
| Đổi `紹介元区分` ở `AW_REFE_002` | Dropdown phía đối lập bị xóa giá trị + disable | `30101:161875` 1.2–1.4 |
| Đổi `紹介先契約ID` | `紹介先法人` + `紹介先拠点` tự lấy lại và ghi đè | `30101:161875` 1.5–1.7 |
| `支払状況` → `支払済み` | `支払日` tự set = ngày hiện tại | `30134:163792` 2.2 |
| `支払状況` = `対象外` | Ô `支払日` bị ẩn | `30134:163792` 2.2 |
| Nhập `調整額` | Real-time tính lại `支払額` dòng + `調整合計額` + `支払合計額` | `30134:163793` 3.11 |
| Thêm dòng bậc số lượng | Ô cận dưới tự điền = cận trên dòng trước + 1; nếu cận trên chưa nhập thì để trống | `30062:155319` 2.5.6 |
| Xóa dòng bậc số lượng | Đánh số lại `No` từ 1 cho các dòng còn lại | `30062:155319` 2.5.1 |

### D. Chuẩn hóa dữ liệu nhập (input normalization)

- Số toàn chiều rộng (全角) **tự động chuyển** sang nửa chiều rộng (半角) khi nhập — áp dụng cho: số tiền phí, số lượng cung cấp, số điện thoại, FAX, mã bưu điện, số tiền điều chỉnh.
- Trường tiền tệ: tự thêm dấu phẩy 3 chữ số khi **mất focus**, bỏ dấu phẩy khi **focus** để chỉnh sửa.
- `代理店名カナ` và `フリガナ`: chỉ nhận Katakana toàn chiều rộng; tự sinh khi mất focus ở ô tên tương ứng; vẫn cho sửa tay sau khi tự điền.
- `備考` ở `AW_FEPL_002`: cho phép nhiều dòng, **giữ nguyên ký tự xuống dòng** khi lưu và hiển thị.

### E. Hiển thị dữ liệu dài / rỗng

- Text vượt độ rộng cột → rút gọn bằng `…`, hiển thị toàn văn bằng **tooltip khi hover**. Áp dụng: 代理店名 · 法人名 · 拠点名 · 支払先 · 紹介フィープラン · 紹介元.
- Tab không có bản ghi → `表示するデータがありません。`
- `終了予定月` trống = Liên tục (vĩnh viễn), không có dự kiến kết thúc.
- `終了月` trống = hợp đồng đang tiếp diễn.
- `支払日` trống = `支払状況` đang là `未払い`.

### F. Giả định KHÔNG được đưa vào flow

Các mục Figma đánh dấu `要確認` / `cần xác nhận` / `提案` đã được tách hoàn toàn sang `## Open Questions`. BA **không** điền giá trị thay thế cho bất kỳ mục nào trong số đó.

---

## Acceptance Criteria

> Mỗi AC dưới đây trace về ít nhất 1 row `FACT` trong `## Source Register`. Không có AC nào xây trên `UNKNOWN` / `CONFLICT`.

### AC-01: Phân quyền hiển thị (RQ-037)
- [ ] Người dùng không có quyền `Create` → không thấy nút `＋新規登録` ở `AW_FEPL_001`, `AW_AGCY_001`, `AW_REFE_001`.
- [ ] Người dùng không có quyền `Update` → không thấy icon ✏ trên dòng danh sách, không thấy nút `編集` ở màn chi tiết, không thấy nút `保存` ở màn chỉnh sửa.
- [ ] Người dùng không có quyền `Delete` → không thấy icon 🗑 trên dòng danh sách và nút `削除` ở màn chi tiết.

### AC-02: Hành vi lưu & hủy chung cho mọi màn Form (RQ-038, RQ-039, RQ-046)
- [ ] Nhấn `保存`/`登録` khi đang lưu → nút bị disable, không cho double-submit.
- [ ] Lưu thành công → hệ thống lấy lại dữ liệu mới nhất, cập nhật màn hình, hiển thị toast `Đã lưu.` / toast hoàn tất.
- [ ] Nhấn `キャンセル` khi **đã có** thay đổi chưa lưu → hiện popup `編集破棄` với nội dung "Các nội dung đang chỉnh sửa sẽ không được lưu. Bạn có chắc chắn muốn hủy các nội dung chỉnh sửa không?".
- [ ] Popup `編集破棄` cũng phải bật khi rời màn qua **menu bên** hoặc **breadcrumb**, không chỉ qua nút Hủy.
- [ ] Nhấn `キャンセル` khi **chưa** nhập gì → chuyển màn ngay, không hiện popup.
- [ ] Popup `削除確認` hiển thị đúng nội dung "Bạn có chắc chắn muốn xóa không? Sau khi xóa sẽ không thể khôi phục."; xóa thành công → `削除が完了しました。`, thất bại → `削除に失敗しました。`.

### AC-03: Master phí giới thiệu — trạng thái hiệu lực (RQ-012)
- [ ] Fee Plan `無効` không xuất hiện trong dropdown chọn gói ở `AW_AGCY_002` và `AW_REFE_002`.
- [ ] Đổi Fee Plan sang `無効` **không** làm thay đổi dữ liệu đã liên kết trước đó.

### AC-04: Master phí giới thiệu — ràng buộc xóa (RQ-011)
- [ ] Fee Plan đang được tham chiếu từ master đại lý / lịch sử giới thiệu / lịch sử thanh toán → **không xóa được**.

### AC-05: Master phí giới thiệu — 3 phương pháp tính (RQ-009, RQ-010, RQ-040, RQ-041, RQ-042)
- [ ] Chọn `固定額` → chỉ panel 2.4 hiển thị; `フィー金額（円）税込` bắt buộc, half-width, tối đa 7 chữ số; không có field thuế suất / số tiền chưa thuế.
- [ ] Chọn `月次提供回の金額` → chỉ panel 2.5 hiển thị; bắt buộc tối thiểu 1 dòng hợp lệ.
- [ ] Trong panel 2.5, cận trên chỉ được để trống ở **dòng cuối cùng**; dòng ở giữa để trống → báo lỗi "Vui lòng nhập cận trên cho các dòng không phải dòng cuối".
- [ ] Cận trên phải ≥ cận dưới, ngược lại → "Vui lòng nhập cận trên lớn hơn hoặc bằng cận dưới".
- [ ] Chọn `請求額割合` → chỉ panel 2.6 hiển thị; `フィー率（%）` bắt buộc; `端数処理` bắt buộc với mặc định `切り捨て`.
- [ ] Xử lý số lẻ áp dụng theo đơn vị yên trên kết quả `số tiền yêu cầu thanh toán × tỷ lệ phí ÷ 100`.
- [ ] Chuyển đổi giữa 3 phương pháp → giá trị của panel bị ẩn được **xóa**.

### AC-06: Master đại lý — gán gói phí (RQ-013)
- [ ] Dropdown `紹介フィープラン` ở `AW_AGCY_002` chỉ liệt kê gói thỏa mãn **cả hai**: Trạng thái = `有効` **VÀ** `紹介元区分` = `代理店紹介`.
- [ ] Bốn ô `フィー支払区分` · `フィー算定方式` · `フィー金額・率` · `フィー支払期間` luôn read-only và tự cập nhật theo gói được chọn.
- [ ] `フィー支払期間` chỉ hiển thị giá trị khi `支払区分` = `継続（ヶ月）`.

### AC-07: Master đại lý — người phụ trách (RQ-014, RQ-015, RQ-016)
- [ ] Chỉ đăng ký được **duy nhất 1** Main admin; chọn Main ở dòng thứ hai → "メイン担当者は1名のみ登録できます。".
- [ ] Email trùng giữa các dòng trong cùng đại lý → "このメールアドレスは既に登録されています。".
- [ ] Icon xóa ở dòng Main admin bị disable; dòng Sub admin xóa được **ngay, không có dialog xác nhận**.
- [ ] Nút `行を追加` thêm dòng trống vào **đầu** bảng.

### AC-08: Master đại lý — màn chi tiết 3 tab (RQ-033, RQ-034, RQ-035)
- [ ] Tab `紹介履歴` và `支払履歴` là **read-only**, không có cột thao tác, admin không sửa/thêm/xóa được.
- [ ] Hai tab chỉ hiển thị dữ liệu thuộc `代理店ID` đang mở.
- [ ] Tab `支払履歴` **không** hiển thị dòng tổng cộng.
- [ ] Tab không có bản ghi → `表示するデータがありません。`.
- [ ] Tab `変更履歴` gồm đúng 3 cột, sắp xếp mới nhất trước; đăng ký mới ghi `データ登録`, sửa 1 mục ghi `{Tên mục}を『{Trước} → {Sau}』に変更`; cập nhật bằng CSV ghi người thay đổi = `CSV取込`.
- [ ] Đại lý đang được tham chiếu → xóa thất bại với `この代理店は使用されているため削除できません。`.

### AC-09: Lịch sử giới thiệu — ràng buộc nguồn & hợp đồng (RQ-019, RQ-020, RQ-022, RQ-043)
- [ ] `紹介元区分` = `代理店` → dropdown đại lý enable, dropdown pháp nhân **xóa giá trị + disable**; và ngược lại.
- [ ] Dropdown `紹介先契約ID` chỉ liệt kê hợp đồng thỏa mãn **cả hai**: trạng thái Hiệu lực **VÀ** chưa liên kết lịch sử giới thiệu nào.
- [ ] Chọn hợp đồng đã có lịch sử → "この契約IDは既に紹介履歴に登録されています。".
- [ ] `紹介先法人` và `紹介先拠点` luôn read-only, tự điền theo hợp đồng, tự ghi đè khi đổi hợp đồng.
- [ ] Ô tìm kiếm ở `AW_REFE_001` khớp một phần trên đủ 5 trường với điều kiện OR.

### AC-10: Lịch sử giới thiệu — ràng buộc năm tháng (RQ-021)
- [ ] `支払い開始年月` phải ≥ `契約開始年月`; vi phạm → "支払い開始年月は契約開始年月以降の年月を選択してください。".
- [ ] Cả hai trường dùng month picker, định dạng hiển thị `yyyy年mm月`.

### AC-11: Lịch sử giới thiệu — ràng buộc xóa (RQ-023, RQ-024)
- [ ] Bản ghi có Trạng thái = `契約中` → không xóa được, hiện toast lỗi.
- [ ] Bản ghi đã phát sinh Lịch sử thanh toán → không xóa được, hiện toast lỗi.
- [ ] Cột Trạng thái chỉ nhận đúng 3 giá trị: `契約中` / `満了` / `途中解約`.

### AC-12: Lịch sử thanh toán — danh sách & guard chỉnh sửa (RQ-028, RQ-032, RQ-044, RQ-047)
- [ ] `処理方法` mặc định do batch set: `支払先区分` = 法人 → `請求相殺`; = 代理店 → `振込`. Admin đổi được ở màn chỉnh sửa.
- [ ] Dòng có `支払状況 = 支払済み` → nhấn ✏ bị chặn với `支払済みの支払履歴は編集できません。`.
- [ ] Ô tìm kiếm khớp một phần trên 2 trường (`支払先名`, `支払いID`) với điều kiện OR.
- [ ] Lưu thành công ở `AW_FEPA_002/003` → **giữ nguyên** màn chỉnh sửa, không điều hướng về danh sách.

### AC-13: Lịch sử thanh toán — trạng thái & ngày thanh toán (RQ-026, RQ-027)
- [ ] `支払状況` có đúng 3 lựa chọn loại trừ: `未払い` / `支払済み` / `対象外`; batch khởi tạo = `未払い`.
- [ ] Đổi sang `支払済み` → `支払日` tự set = ngày hiện tại, admin vẫn sửa được.
- [ ] `支払状況` = `未払い` → `支払日` để trống. `支払状況` = `対象外` → ô `支払日` bị ẩn.

### AC-14: Lịch sử thanh toán — bảng chi tiết & số tiền điều chỉnh (RQ-029, RQ-030, RQ-031)
- [ ] Trong bảng `紹介フィー内訳`, **chỉ** cột `調整額` cho nhập; không thêm / xóa / sắp xếp dòng; không phân trang.
- [ ] `調整額` chấp nhận số nguyên trong khoảng −9.999.999 ~ 9.999.999, half-width, **không** cho số thập phân; giá trị ban đầu `0円`.
- [ ] Ngoài phạm vi → "調整額は-9,999,999〜9,999,999の範囲で入力してください。"; sai định dạng → "調整額は半角数字（整数）で入力してください。".
- [ ] `調整額` chỉ nhập được khi `支払状況 = 未払い`; disable khi `支払済み` / `対象外`.
- [ ] Nhập `調整額` → `支払額` của dòng, `調整合計額` và `支払合計額` cập nhật **real-time**.
- [ ] `支払合計額` = `算定合計額` + `調整合計額`.

### AC-15: Quy tắc ID sinh tự động (RQ-002, RQ-003, RQ-004, RQ-005, RQ-006)
- [ ] Fee Plan ID = `RFP` + 6 chữ số tuần tự (VD `RFP000001`).
- [ ] Agency ID = `AG` + 5 chữ số (VD `AG00001`).
- [ ] Referral ID = `REF` + 6 chữ số (VD `REF000005`).
- [ ] Payment ID = `FP` + `yyyymm` + `-` + 4 chữ số (VD `FP202608-0001`), trong đó `yyyymm` = `支払対象月`.
- [ ] Ở màn đăng ký, ô ID để trống kèm placeholder; ID chỉ được cấp khi đăng ký hoàn tất.

### AC-16: Phân trang (RQ-036)
- [ ] Hiển thị `{Tổng số}件中 {Từ}−{Đến}件` (VD `100件中 1−10件`).
- [ ] Điều hướng gồm Trước (`<`) · Sau (`>`) · số trang · dấu lược (`...`); trang hiện tại highlight màu xanh.
- [ ] Dropdown số dòng/trang mặc định `10件/ページ`.

### AC-17: Tự động điền địa chỉ (RQ-017, RQ-018)
- [ ] Nhập đủ 7 chữ số `郵便番号` và mất focus → tự điền `都道府県` · `市区町村` · `町域・番地`.
- [ ] Mã bưu điện không tồn tại → **không** điền, **không** báo lỗi, giữ nguyên giá trị đã nhập.
- [ ] Sau khi tự điền, cả 3 ô vẫn sửa tay được.
- [ ] `代理店名カナ` tự sinh khi mất focus ở `代理店名`, vẫn sửa tay được; chỉ nhận Katakana toàn chiều rộng.

---

## Out of Scope

Những nội dung sau **không** thuộc phạm vi SPEC này vì **không xuất hiện trong Figma nguồn**:

- **Dashboard hiệu suất giới thiệu / biểu đồ xu hướng** — có trong SPEC cũ `agency-management` (`AW_AGCY_013`) nhưng Figma không có màn tương ứng.
- **Doanh số theo đại lý (Sales by Agency)** — SPEC cũ `AW_AGCY_010`, Figma không có.
- **Performance Summary tab** — SPEC cũ `AW_AGCY_005`, Figma chỉ có 3 tab (紹介履歴 / 支払履歴 / 変更履歴).
- **Marketing / Referral Campaign / Free Campaign** — đã bị loại khỏi scope hệ thống (ghi nhận ở SPEC cũ).
- **Màn hình Chi tiết hợp đồng · Chi tiết chi nhánh · Chi tiết pháp nhân** — chỉ là đích điều hướng của text link, thuộc domain khác.
- **Chức năng tạo / xóa thủ công bản ghi `支払履歴`** — Figma không có nút tương ứng; bản ghi do batch sinh.
- **Thiết kế batch job** (lịch chạy, retry, cảnh báo lỗi) — Figma chỉ nêu kết quả batch, không mô tả cơ chế.
- **Nghiệp vụ CSV** — chưa chốt là xuất hay nhập (OQ-03), không đưa vào scope cho tới khi có quyết định.

---

## Screens

> **TỔNG: 33 màn hình** = **17 màn chính** + **16 màn lỗi/popup**.
>
> | Loại | Số lượng | Đếm vào tổng? |
> |---|---|---|
> | Màn hình chính | 17 | ✅ |
> | Modal có Screen Code riêng (`削除確認` ×3 · `編集破棄` ×4) | 7 | ✅ |
> | Toast / Empty state (không có Screen Code riêng) | 9 | ✅ |
> | **Cộng màn lỗi/popup** | **16** | ✅ |
> | Inline error / Button disabled | 64 | ❌ — chỉ là state |
> | **Tổng error display định nghĩa** | **74** (`E-001`…`E-074`) | |
>
> Trong đó **7 Modal có Screen Code riêng** (`AW_FEPL_005/006`, `AW_AGCY_005/006`, `AW_REFE_006/007`, `AW_FEPA_005`) vì mang nội dung nghiệp vụ riêng và tồn tại như node độc lập trong Figma.

| Screen Code | Screen | Actor | App | Screen Type | Transition To | Figma Link |
|---|---|---|---|---|---|---|
| AW_FEPL_001 | 紹介フィーマスタ（一覧）— Danh sách Master phí giới thiệu | E03 | E03 | List | `[＋新規登録]` → AW_FEPL_002 / `[click ID]` → AW_FEPL_004 / `[✏]` → AW_FEPL_003 / `[🗑]` → AW_FEPL_005 | `29419:271225` |
| AW_FEPL_002 | 紹介フィーマスタ登録 — Đăng ký Fee Plan | E03 | E03 | Form | `[登録 OK]` → AW_FEPL_001 / `[キャンセル + đã nhập]` → AW_FEPL_006 | `29419:271321` |
| AW_FEPL_003 | 紹介フィーマスタ編集 — Chỉnh sửa Fee Plan | E03 | E03 | Form | `[保存 OK]` → AW_FEPL_004 / `[キャンセル + có thay đổi]` → AW_FEPL_006 | `29419:271404` |
| AW_FEPL_004 | 紹介フィーマスタ詳細 — Chi tiết Fee Plan | E03 | E03 | Detail | `[編集]` → AW_FEPL_003 / `[削除]` → AW_FEPL_005 | `29419:271499` |
| AW_FEPL_005 | 削除確認 — Popup xác nhận xóa Fee Plan | E03 | E03 | Modal | `[削除]` → AW_FEPL_001 + Toast / `[キャンセル]` → màn gọi | `29419:271710` |
| AW_FEPL_006 | 編集破棄 — Popup xác nhận hủy chỉnh sửa | E03 | E03 | Modal | `[廃棄]` → màn đích / `[キャンセル]` → AW_FEPL_002 hoặc AW_FEPL_003 | `29419:271721` |
| AW_AGCY_001 | 代理店マスタ（一覧）— Danh sách Master đại lý | E03 | E03 | List | `[＋新規登録]` → AW_AGCY_002 / `[click ID]` → AW_AGCY_004 / `[✏]` → AW_AGCY_003 / `[🗑]` → AW_AGCY_005 | `29419:269792` |
| AW_AGCY_002 | 代理店登録 — Đăng ký đại lý | E03 | E03 | Form | `[登録 OK]` → AW_AGCY_001 / `[キャンセル + đã nhập]` → AW_AGCY_006 | `29419:270424` |
| AW_AGCY_003 | 代理店情報編集 — Chỉnh sửa thông tin đại lý | E03 | E03 | Form | `[保存 OK]` → AW_AGCY_004 / `[キャンセル + có thay đổi]` → AW_AGCY_006 | `29419:267329` |
| AW_AGCY_004 | 代理店情報詳細 — Chi tiết đại lý (3 tab) | E03 | E03 | Detail | `[編集]` → AW_AGCY_003 / `[削除]` → AW_AGCY_005 / `[click 紹介ID]` → AW_REFE_005 / `[click 支払いID]` → AW_FEPA_004 | `29419:267332` |
| AW_AGCY_005 | 削除確認 — Popup xác nhận xóa đại lý | E03 | E03 | Modal | `[削除]` → AW_AGCY_001 + Toast / `[キャンセル]` → màn gọi | `29419:270945` |
| AW_AGCY_006 | 編集破棄 — Popup xác nhận hủy chỉnh sửa | E03 | E03 | Modal | `[廃棄]` → màn đích / `[キャンセル]` → AW_AGCY_002 hoặc AW_AGCY_003 | `29419:270956` |
| AW_REFE_001 | 紹介履歴一覧 — Danh sách lịch sử giới thiệu | E03 | E03 | List | `[＋新規登録]` → AW_REFE_002 / `[click 紹介ID]` → AW_REFE_005 / `[✏]` → AW_REFE_003 hoặc AW_REFE_004 / `[🗑]` → AW_REFE_006 | `29419:269959` |
| AW_REFE_002 | 紹介履歴登録 — Đăng ký lịch sử giới thiệu | E03 | E03 | Form | `[登録 OK]` → AW_REFE_001 / `[キャンセル + đã nhập]` → AW_REFE_007 | `29419:270966` |
| AW_REFE_003 | 紹介履歴編集（代理店）— Chỉnh sửa, nguồn = Đại lý | E03 | E03 | Form | `[保存 OK]` → AW_REFE_005 / `[キャンセル + có thay đổi]` → AW_REFE_007 | `29419:271019` |
| AW_REFE_004 | 紹介履歴編集（法人）— Chỉnh sửa, nguồn = Pháp nhân | E03 | E03 | Form | `[保存 OK]` → AW_REFE_005 / `[キャンセル + có thay đổi]` → AW_REFE_007 | `29419:271141` |
| AW_REFE_005 | 紹介履歴詳細 — Chi tiết lịch sử giới thiệu | E03 | E03 | Detail | `[編集]` → AW_REFE_003 hoặc AW_REFE_004 | `29419:271080` |
| AW_REFE_006 | 削除確認 — Popup xác nhận xóa lịch sử giới thiệu | E03 | E03 | Modal | `[削除]` → AW_REFE_001 + Toast / `[キャンセル]` → màn gọi | `29419:271201` |
| AW_REFE_007 | 編集破棄 — Popup xác nhận hủy chỉnh sửa | E03 | E03 | Modal | `[廃棄]` → màn đích / `[キャンセル]` → màn chỉnh sửa | `29419:271212` |
| AW_FEPA_001 | 支払履歴一覧 — Danh sách lịch sử thanh toán phí | E03 | E03 | List | `[click 支払いID]` → AW_FEPA_004 / `[✏]` → AW_FEPA_002 hoặc AW_FEPA_003 | `29419:267914` |
| AW_FEPA_002 | フィー支払履歴編集（代理店）— Chỉnh sửa thanh toán, bên nhận = Đại lý | E03 | E03 | Form | `[保存 OK]` → **giữ nguyên AW_FEPA_002** / `[キャンセル + có thay đổi]` → AW_FEPA_005 | `29419:268381` |
| AW_FEPA_003 | フィー支払履歴編集（法人）— Chỉnh sửa thanh toán, bên nhận = Pháp nhân | E03 | E03 | Form | `[保存 OK]` → **giữ nguyên AW_FEPA_003** / `[キャンセル + có thay đổi]` → AW_FEPA_005 | `29419:268853` |
| AW_FEPA_004 | フィー支払履歴詳細 — Chi tiết thanh toán phí | E03 | E03 | Detail | `[編集]` → AW_FEPA_002 hoặc AW_FEPA_003 / `[click 紹介ID]` → AW_REFE_005 | `29419:269325` |
| AW_FEPA_005 | 編集破棄 — Popup xác nhận hủy chỉnh sửa | E03 | E03 | Modal | `[廃棄]` → màn đích / `[キャンセル]` → màn chỉnh sửa | `29419:271219` |

> **Cột `Figma Link`** đã điền sẵn node-id của **design thật** (không phải frame BA vẽ). URL đầy đủ: `https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=<node-id>` (thay `:` bằng `-` trong node-id khi ghép URL).

---

## Screen Details

> **Quy ước Non-Happy:** nhóm nào Figma **không** cung cấp evidence được ghi `UNKNOWN` ở cột Trigger — theo yêu cầu "100% Figma, không tự động thêm", BA **không** bịa hành vi thay thế. Các nhóm này sẽ được đưa vào `## Open Questions` (OQ-14).

### AW_FEPL_001 — 紹介フィーマスタ（一覧）

**Happy Case:**
- Layout: Sidebar trái (`代理・紹介管理` → `紹介フィーマスタ` active) · Header breadcrumb · Page header có nút `＋新規登録` góc phải · Bảng danh sách · Phân trang dưới cùng.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Page header | Button primary `＋新規登録` | Chỉ hiển thị với quyền Create | → AW_FEPL_002 |
  | Table | `No` | Số thứ tự hiển thị | — |
  | Table | `フィープランID` (text link) | `RFP` + 6 số, VD `RFP000001` | → AW_FEPL_004 |
  | Table | `フィープラン名` | Tên nhận biết gói phí | — |
  | Table | `紹介元区分` | `法人` / `代理店` | — |
  | Table | `支払区分` | `単発` / `連続` | — |
  | Table | `算定方式` | `固定額` / `プラン別` / `請求額割合` | — |
  | Table | `フィー金額・率` | 固定額 → `33,000円` · 請求額割合 → `10%` · プラン別 → `プラン別設定` | — |
  | Table | `支払期間` | 単発 → `1回` · 連続 → `36ヶ月` hoặc `永続` | — |
  | Table | `状態` | `有効` / `無効` | — |
  | Table | `最終更新日` | `yyyy-mm-dd`, hệ thống tự cập nhật | — |
  | Table | Icon ✏ | Chỉ hiển thị với quyền Update | → AW_FEPL_003 |
  | Table | Icon 🗑 | Chỉ hiển thị với quyền Delete | → AW_FEPL_005 |
  | Footer | Phân trang | `{Tổng số}件中 {Từ}−{Đến}件` · `<` `>` · số trang · `...` · dropdown số dòng (mặc định `10件/ページ`) | Click / Chọn |
- Interactions: trang hiện tại được highlight màu xanh.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | N/A — màn read-only, không có input | — | — |
| 2 Auth/Permission | Người dùng không có quyền Create/Update/Delete | Button disabled | — *(ẩn hay disable: chưa chốt — OQ)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | UNKNOWN — Figma không mô tả empty state cho màn này | — | — |
| 6 Conflict | UNKNOWN — Figma không mô tả | — | — |
| 7 Business rule | Xóa Fee Plan đang được tham chiếu (master đại lý / lịch sử giới thiệu / lịch sử thanh toán) | Toast | *(E-001)* Nội dung message: UNKNOWN — Figma chỉ ghi "Không thể xóa" |
| 8 External | N/A — màn không gọi service ngoài | — | — |

### AW_FEPL_002 — 紹介フィーマスタ登録

**Happy Case:**
- Layout: 2 section accordion (mặc định mở) — `紹介フィー情報` và `フィー条件`; nút `キャンセル` / `登録` ở header.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Button `キャンセル` | — | `[đã nhập]` → AW_FEPL_006 / `[chưa nhập]` → AW_FEPL_001 |
  | Header | Button primary `登録` | Chỉ hiển thị khi quyền = Quản trị viên | Submit → AW_FEPL_001 |
  | S1 | `フィープランID` (read-only) | Trống + placeholder `ID gói phí`; cấp khi đăng ký xong | — |
  | S1 | `フィープラン名` (Text) | ✅ Bắt buộc | Nhập |
  | S1 | `紹介元区分` (Radio) | ✅ Bắt buộc · `法人紹介` / `代理店紹介` · mặc định `法人紹介` | Chọn |
  | S1 | `ステータス` (Radio) | ✅ Bắt buộc · `有効` / `無効` · mặc định `有効` | Chọn |
  | S1 | `備考` (Textarea) | Tùy chọn · giữ nguyên ký tự xuống dòng | Nhập |
  | S2 | `支払区分` (Radio) | ✅ Bắt buộc · `単発` / `継続（ヶ月）` / `継続（永続）` · mặc định `単発` | Chọn → enable/disable 支払い期間 |
  | S2 | `支払い期間（ヶ月）` (Text) | ✅ Bắt buộc **chỉ khi** 支払区分 = `継続（ヶ月）`; ngược lại xóa giá trị + disable (xám) | Nhập |
  | S2 | `算定方法` (Radio) | ✅ Bắt buộc · `固定額` / `月次提供回の金額` / `請求額割合` · mặc định `固定額` · có dòng mô tả phía trên | Chọn → đổi panel |
  | S2 panel 2.4 | `フィー金額（円）税込` (Text) | ✅ Bắt buộc · chỉ khi 算定方法 = `固定額` · badge `必須` góc phải panel | Nhập |
  | S2 panel 2.5 | Bảng bậc số lượng | ✅ Bắt buộc · chỉ khi 算定方法 = `月次提供回の金額` · tối thiểu 1 dòng · cột `No` / `下限` / `上限` / `紹介フィー金額（円）` / 🗑 · nút `行を追加` | Nhập / Click |
  | S2 panel 2.6 | `フィー率（%）` (Text) + `端数処理` (Radio) | ✅ Bắt buộc · chỉ khi 算定方法 = `請求額割合` · 端数処理 mặc định `切り捨て` | Nhập / Chọn |
- Interactions: đổi `算定方法` → panel bị ẩn **bị xóa giá trị**; nút `登録` disable trong lúc lưu.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | `フィープラン名` để trống | Inline error | *(E-002)* "Vui lòng nhập tên gói phí" |
| 1 Validation | `紹介元区分` chưa chọn | Inline error | *(E-003)* "Vui lòng chọn phân loại nguồn giới thiệu" |
| 1 Validation | `ステータス` chưa chọn | Inline error | *(E-004)* "Vui lòng chọn trạng thái" |
| 1 Validation | `支払区分` chưa chọn | Inline error | *(E-005)* "Vui lòng chọn phân loại thanh toán" |
| 1 Validation | `支払い期間` trống khi 支払区分 = 継続（ヶ月） | Inline error | *(E-006)* "Vui lòng nhập kỳ hạn thanh toán" |
| 1 Validation | `算定方法` chưa chọn | Inline error | *(E-007)* "Vui lòng chọn phương pháp tính" |
| 1 Validation | `フィー金額` trống | Inline error | *(E-008)* "Vui lòng nhập số tiền phí" |
| 1 Validation | `フィー金額` sai định dạng / quá 7 chữ số | Inline error | *(E-009)* "Vui lòng nhập số tiền phí bằng số half-width, tối đa 7 chữ số." |
| 1 Validation | Panel 2.5 không có dòng hợp lệ nào | Inline error | *(E-010)* "Vui lòng nhập ít nhất 1 dòng cho Số tiền theo lần cung cấp hàng tháng" |
| 1 Validation | Cận dưới để trống | Inline error | *(E-011)* "Vui lòng nhập số lượng cung cấp hàng tháng (cận dưới)" |
| 1 Validation | Cận dưới sai định dạng | Inline error | *(E-012)* "Vui lòng nhập số lượng cung cấp (cận dưới) bằng số half-width, tối đa 7 chữ số." |
| 1 Validation | Cận trên < cận dưới | Inline error | *(E-013)* "Vui lòng nhập cận trên lớn hơn hoặc bằng cận dưới" |
| 1 Validation | Cận trên để trống ở dòng **không phải** dòng cuối | Inline error | *(E-014)* "Vui lòng nhập cận trên cho các dòng không phải dòng cuối" |
| 1 Validation | Cận trên sai định dạng | Inline error | *(E-015)* "Vui lòng nhập cận trên bằng số half-width, tối đa 7 chữ số." |
| 1 Validation | `紹介フィー金額` để trống | Inline error | *(E-016)* "Vui lòng nhập số tiền phí giới thiệu" |
| 1 Validation | `紹介フィー金額` sai định dạng | Inline error | *(E-017)* "Vui lòng nhập số tiền phí giới thiệu bằng số half-width, tối đa 7 chữ số." |
| 1 Validation | `フィー率` để trống | Inline error | *(E-018)* "Vui lòng nhập tỷ lệ phí" |
| 1 Validation | `端数処理` chưa chọn | Inline error | *(E-019)* "Vui lòng chọn xử lý số lẻ" |
| 2 Auth/Permission | Không có quyền Create | Button disabled | — *(nút `登録` không hiển thị)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | N/A — màn form, không có danh sách dữ liệu | — | — |
| 6 Conflict | Nhấn `登録` nhiều lần liên tiếp | Button disabled | — *(nút bị vô hiệu hóa trong khi lưu)* |
| 7 Business rule | Xóa dòng bậc khi chỉ còn 1 dòng | Inline error | *(E-020)* "Cần tối thiểu 1 dòng" |
| 8 External | N/A — màn không gọi service ngoài | — | — |

### AW_FEPL_003 — 紹介フィーマスタ編集

**Happy Case:**
- Layout: giống `AW_FEPL_002`, thêm bảng `変更情報テーブル` phía dưới; header có `キャンセル` / `保存`.
- Components: **item định nghĩa giống `AW_FEPL_002`**, khác ở các điểm Figma nêu rõ:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Button `保存` | Chỉ hiển thị với quyền Update · disable trong lúc lưu | Lưu → toast `Đã lưu.` |
  | Header | Button `キャンセル` | Luôn hiển thị | `[có thay đổi]` → AW_FEPL_006 / `[không]` → AW_FEPL_004 |
  | Body | `フィープランID` | Hiển thị giá trị đã cấp, read-only | — |
  | Body | `紹介元区分` · `支払区分` · `算定方式` · `フィー金額・率` · `支払期間` · `状態` | **Sửa được** (danh sách chỉ read-only) | Chọn / Nhập |
  | Footer | `変更情報テーブル` | 3 cột `変更日時` / `変更内容` / `変更者`, mới nhất trước, read-only | — |
- Interactions: giống `AW_FEPL_002`.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | Toàn bộ rule validation giống `AW_FEPL_002` (E-002 → E-019) | Inline error | *(tái sử dụng E-002…E-019)* |
| 2 Auth/Permission | Không có quyền Update | Button disabled | — *(nút `保存` không hiển thị)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | N/A — màn form | — | — |
| 6 Conflict | Rời màn khi có thay đổi chưa lưu | Modal | *(E-021)* "Các nội dung đang chỉnh sửa sẽ không được lưu. Bạn có chắc chắn muốn hủy các nội dung chỉnh sửa không?" → AW_FEPL_006 |
| 7 Business rule | UNKNOWN — Figma không mô tả rule chặn sửa | — | — |
| 8 External | N/A | — | — |

### AW_FEPL_004 — 紹介フィーマスタ詳細

**Happy Case:**
- Layout: giống `AW_FEPL_003` nhưng toàn bộ item read-only; header có `削除` và `編集`; dưới cùng là `変更情報テーブル`.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Button `編集` | Chỉ hiển thị với quyền Update | → AW_FEPL_003 |
  | Header | Button `削除` | Chỉ hiển thị với quyền Delete | → AW_FEPL_005 |
  | Body | Toàn bộ item của Fee Plan | Read-only | — |
  | Footer | `変更情報テーブル` | 3 cột, mới nhất trước | — |
- Interactions: UNKNOWN — Figma không mô tả thêm.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | N/A — màn read-only | — | — |
| 2 Auth/Permission | Không có quyền Update / Delete | Button disabled | — *(ẩn nút tương ứng)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | Chưa có bản ghi nào trong `変更情報テーブル` | Empty state | *(E-022)* Nội dung message: UNKNOWN — Figma chỉ định nghĩa message này cho tab của màn đại lý |
| 6 Conflict | UNKNOWN — Figma không mô tả | — | — |
| 7 Business rule | Nhấn `削除` khi Fee Plan đang được tham chiếu | Toast | *(tái sử dụng E-001)* |
| 8 External | N/A | — | — |

### AW_FEPL_005 — 削除確認（Popup xác nhận xóa Fee Plan）

**Happy Case:**
- Layout: Modal overlay 450×316, nội dung xác nhận + 2 nút.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Body | Text xác nhận | "Bạn có chắc chắn muốn xóa không? Sau khi xóa sẽ không thể khôi phục." | — |
  | Footer | Button `削除` | — | Xóa → đóng popup |
  | Footer | Button `キャンセル` | — | Đóng popup, giữ nguyên màn gọi |
- Interactions: đóng popup sau khi xử lý xong.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | N/A — popup chỉ có 2 nút | — | — |
| 2 Auth/Permission | N/A — popup chỉ mở được từ nút đã kiểm tra quyền | — | — |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | Xóa thất bại | Toast | *(E-023)* "削除に失敗しました。" |
| 5 Empty | N/A | — | — |
| 6 Conflict | UNKNOWN — Figma không mô tả | — | — |
| 7 Business rule | Bản ghi đang được tham chiếu | Toast | *(tái sử dụng E-001)* |
| 8 External | N/A | — | — |

> **Happy toast:** xóa thành công → Toast *(E-024)* `"削除が完了しました。"`

### AW_FEPL_006 — 編集破棄（Popup xác nhận hủy chỉnh sửa）

**Happy Case:**
- Layout: Modal overlay 450×316.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Body | Text xác nhận | "Các nội dung đang chỉnh sửa sẽ không được lưu.<br>Bạn có chắc chắn muốn hủy các nội dung chỉnh sửa không?" | — |
  | Footer | Button `廃棄` | Hủy toàn bộ nội dung đang sửa, không lưu | Đóng popup → chuyển tới màn đích đã chỉ định |
  | Footer | Button `キャンセル` | Đóng popup mà không lưu | → quay lại màn chỉnh sửa |
- Interactions: popup chỉ bật khi **có thay đổi** trên form và người dùng thực hiện 1 trong 3 thao tác: nút `Hủy`/`Quay lại` · menu bên trái · breadcrumb.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | N/A | — | — |
| 2 Auth/Permission | N/A | — | — |
| 3 Network | N/A — thao tác client-side | — | — |
| 4 Server error | N/A — thao tác client-side | — | — |
| 5 Empty | N/A | — | — |
| 6 Conflict | N/A — popup chính là cơ chế xử lý conflict rời màn | — | — |
| 7 Business rule | N/A | — | — |
| 8 External | N/A | — | — |

### AW_AGCY_001 — 代理店マスタ（一覧）

**Happy Case:**
- Layout: Sidebar (`代理店マスタ` active) · breadcrumb `代理・紹介管理 / 代理店マスタ` · page header có `CSV出力` + `＋新規登録` · panel tìm kiếm thu gọn được · bảng danh sách · phân trang.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Page header | Button `＋新規登録` | Chỉ hiển thị với quyền Create | → AW_AGCY_002 |
  | Page header | Button `CSV出力` | ⚠️ Xem OQ-03 — nhãn và mô tả mâu thuẫn | Click |
  | Search | `検索エリア` (Text) | Khớp một phần theo ID・tên đại lý; để trống = tìm tất cả | Nhập |
  | Search | `紹介フィープラン` (Dropdown) | Tham chiếu động Master phí; mặc định chưa chọn = toàn bộ | Chọn |
  | Search | `ステータス` (Dropdown) | `有効` / `無効`; mặc định chưa chọn = toàn bộ | Chọn |
  | Search | Button `クリア` | Xóa toàn bộ điều kiện, hiển thị lại toàn bộ dữ liệu | Click |
  | Search | Button `検索` | Thực thi tìm kiếm, cập nhật danh sách | Click |
  | Search | Button `並べ替え` | Mở dropdown chọn khóa sắp xếp + tăng/giảm | Click |
  | Table | `代理店ID` (text link) | `AG` + 5 số, VD `AG00001` | → AW_AGCY_004 |
  | Table | `代理店名` | Tên chính thức; vượt cột → `…` + tooltip | Hover |
  | Table | `紹介フィープラン` | Tên gói liên kết Master phí | — |
  | Table | `メイン担当者名` | Tên người phụ trách nhập tay ở màn đăng ký | — |
  | Table | `紹介合計数` | Đếm **tất cả** hồ sơ giới thiệu, bất kể trạng thái | — |
  | Table | `支払対象数` | Hợp đồng active **VÀ** kỳ hạn thanh toán chưa hết hạn | — |
  | Table | `現在契約中` | Hồ sơ có hợp đồng chính thức active | — |
  | Table | `ステータス` (badge) | `有効` = xanh lá · `無効` = đỏ | — |
  | Table | Icon ✏ | Chỉ hiển thị với quyền Update | → AW_AGCY_003 |
  | Table | Icon 🗑 | Chỉ hiển thị với quyền Delete; **ẩn** ở dòng đại lý đã bị xóa | → AW_AGCY_005 |
  | Footer | Phân trang | Giống AW_FEPL_001 | Click / Chọn |
- Interactions: hover tên dài → tooltip toàn văn; trang hiện tại highlight xanh.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | File CSV sai định dạng | Inline error | *(E-025)* "Định dạng CSV không đúng. Vui lòng kiểm tra lại định dạng" |
| 2 Auth/Permission | Không có quyền Create/Update/Delete | Button disabled | — *(ẩn nút/icon tương ứng)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | UNKNOWN — Figma không mô tả empty state cho danh sách này | — | — |
| 6 Conflict | UNKNOWN — Figma không mô tả | — | — |
| 7 Business rule | Xóa đại lý đang được tham chiếu trong Lịch sử giới thiệu hoặc Lịch sử thanh toán | Toast | *(E-026)* "この代理店は使用されているため削除できません。" |
| 8 External | UNKNOWN — Figma không mô tả | — | — |

### AW_AGCY_002 — 代理店登録

**Happy Case:**
- Layout: 3 section — `代理店情報` · `紹介フィープラン` · `担当者`; header có `キャンセル` / `登録`.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Button `キャンセル` | Luôn hiển thị | `[đã nhập]` → AW_AGCY_006 / `[chưa nhập]` → AW_AGCY_001 ngay |
  | Header | Button primary `登録` | Chỉ hiển thị với quyền Create | Submit → AW_AGCY_001 |
  | S1 | `代理店ID` (read-only) | Trống + placeholder `代理店ID`; cấp khi đăng ký xong (`AG`+5 số) | — |
  | S1 | `代理店名` (Text) | ✅ Bắt buộc · 1–50 ký tự | Nhập |
  | S1 | `代理店名カナ` (Text) | ✅ Bắt buộc · 1–50 ký tự · chỉ Katakana toàn chiều rộng · tự sinh khi mất focus ở `代理店名` | Tự động / Nhập |
  | S1 | `ステータス` (Dropdown) | ✅ Bắt buộc · `有効` / `無効` (không có `削除済み`) · mặc định `有効` | Chọn |
  | S1 | `電話番号` (Text) | ✅ Bắt buộc · 10–11 số · half-width + gạch ngang · placeholder `000-0000-0000` | Nhập |
  | S1 | `FAX番号` (Text) | Tùy chọn · 10–11 số · placeholder `00-0000-0000` | Nhập |
  | S1 | `郵便番号` (Text) | ✅ Bắt buộc · 7 số half-width · mất focus → tự điền địa chỉ | Nhập / Mất focus |
  | S1 | `都道府県` (Dropdown) | ✅ Bắt buộc · 47 tỉnh thành (master) · tự điền từ mã bưu điện | Chọn |
  | S1 | `市区町村` (Text) | ✅ Bắt buộc · ≤255 · tự điền từ mã bưu điện | Nhập / Tự động |
  | S1 | `町域・番地` (Text) | ✅ Bắt buộc · ≤255 · tự điền đến tên phường/xã, user nhập thêm số nhà | Nhập / Tự động |
  | S1 | `建物・部屋番号` (Text) | Tùy chọn · ≤255 | Nhập |
  | S1 | `備考` (Text) | Tùy chọn · ≤255 | Nhập |
  | S2 | `紹介フィープラン` (Dropdown) | ✅ Bắt buộc · chỉ gói `有効` **VÀ** `紹介元区分 = 代理店紹介` | Chọn → tự điền 2.2–2.5 |
  | S2 | `フィー支払区分` (read-only) | Tự hiển thị từ gói; disable khi chưa chọn gói | — |
  | S2 | `フィー算定方式` (read-only) | Tự hiển thị từ gói | — |
  | S2 | `フィー金額・率` (read-only) | Tự hiển thị theo phương pháp tính của gói | — |
  | S2 | `フィー支払期間` (read-only) | Chỉ hiển thị khi 支払区分 = `継続（ヶ月）`; ngược lại trống + disable | — |
  | S3 | `区分` (Dropdown) | ✅ Bắt buộc · `メイン担当者` / `サブ担当者` · chỉ 1 Main | Chọn |
  | S3 | `担当者名` (Text) | ✅ Bắt buộc · 1–50 | Nhập |
  | S3 | `フリガナ` (Text) | Tùy chọn · ≤50 · Katakana toàn chiều rộng · tự sinh khi mất focus ở `担当者名` | Tự động / Nhập |
  | S3 | `メールアドレス` (Text) | ✅ Bắt buộc · ≤256 · đúng định dạng email · không trùng trong cùng đại lý | Nhập |
  | S3 | `電話番号` (Text) | Tùy chọn · 10–11 số | Nhập |
  | S3 | Icon 🗑 | Chỉ quyền Delete · **chỉ active với dòng Sub admin** · xóa ngay không có dialog | Click |
  | S3 | Button `行を追加` | Chỉ hiển thị ở chế độ đăng ký・chỉnh sửa | Thêm dòng trống lên **đầu** bảng |
- Interactions: đổi gói phí → 4 ô read-only tự lấy lại; số toàn chiều rộng tự chuyển half-width.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | `代理店名` để trống | Inline error | *(E-027)* "代理店名を入力してください。" |
| 1 Validation | `代理店名` > 50 ký tự | Inline error | *(E-028)* "代理店名は50文字以内で入力してください。" |
| 1 Validation | `代理店名カナ` để trống | Inline error | *(E-029)* "代理店名カナを入力してください。" |
| 1 Validation | `代理店名カナ` không phải Katakana toàn chiều rộng | Inline error | *(E-030)* "カナは全角カナで入力してください。" |
| 1 Validation | `代理店名カナ` > 50 ký tự | Inline error | *(E-031)* "カナは50文字以内で入力してください。" |
| 1 Validation | `ステータス` chưa chọn | Inline error | *(E-032)* "ステータスを選択してください。" |
| 1 Validation | `電話番号` để trống | Inline error | *(E-033)* "電話番号を入力してください。" |
| 1 Validation | `電話番号` sai định dạng | Inline error | *(E-034)* "電話番号の形式が正しくありません（半角数字・ハイフン、10〜11桁）。" |
| 1 Validation | `FAX番号` sai định dạng (khi có nhập) | Inline error | *(E-035)* "FAX番号の形式が正しくありません（半角数字・ハイフン、10〜11桁）。" |
| 1 Validation | `郵便番号` để trống | Inline error | *(E-036)* "郵便番号を入力してください。" |
| 1 Validation | `郵便番号` sai định dạng | Inline error | *(E-037)* "郵便番号は7桁の半角数字で入力してください。" |
| 1 Validation | `都道府県` chưa chọn | Inline error | *(E-038)* "都道府県を選択してください。" |
| 1 Validation | `市区町村` để trống | Inline error | *(E-039)* "市区町村を入力してください。" |
| 1 Validation | `市区町村` > 255 ký tự | Inline error | *(E-040)* "市区町村は255文字以内で入力してください。" |
| 1 Validation | `町域・番地` để trống | Inline error | *(E-041)* "町域・番地を入力してください。" |
| 1 Validation | `町域・番地` > 255 ký tự | Inline error | *(E-042)* "町域・番地は255文字以内で入力してください。" |
| 1 Validation | `建物・部屋番号` > 255 ký tự | Inline error | *(E-043)* "建物・部屋番号は255文字以内で入力してください。" |
| 1 Validation | `備考` > 255 ký tự | Inline error | *(E-044)* "Ghi chú không được vượt quá 255 ký tự" |
| 1 Validation | `紹介フィープラン` chưa chọn | Inline error | *(E-045)* "紹介フィープランを選択してください。" |
| 1 Validation | `区分` chưa chọn | Inline error | *(E-046)* "区分を選択してください。" |
| 1 Validation | `担当者名` để trống | Inline error | *(E-047)* "担当者名を入力してください。" |
| 1 Validation | `担当者名` > 50 ký tự | Inline error | *(E-048)* "担当者名は50文字以内で入力してください。" |
| 1 Validation | `フリガナ` không phải Katakana toàn chiều rộng | Inline error | *(E-049)* "フリガナは全角カタカナで入力してください。" |
| 1 Validation | `フリガナ` > 50 ký tự | Inline error | *(E-050)* "フリガナは50文字以内で入力してください。" |
| 1 Validation | `メールアドレス` để trống | Inline error | *(E-051)* "メールアドレスを入力してください。" |
| 1 Validation | `メールアドレス` sai định dạng | Inline error | *(E-052)* "メールアドレスの形式が正しくありません。" |
| 1 Validation | `メールアドレス` > 256 ký tự | Inline error | *(E-053)* "メールアドレスは256文字以内で入力してください。" |
| 1 Validation | `電話番号` (担当者) sai định dạng khi có nhập | Inline error | *(E-054)* "電話番号の形式が正しくありません（半角数字・ハイフン、10〜11桁）。" |
| 2 Auth/Permission | Không có quyền Create | Button disabled | — *(nút `登録` không hiển thị)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | UNKNOWN — Figma không mô tả empty state cho dropdown gói phí rỗng | — | — |
| 6 Conflict | `メールアドレス` trùng với dòng người phụ trách khác | Inline error | *(E-055)* "このメールアドレスは既に登録されています。" |
| 6 Conflict | Chọn `メイン担当者` ở dòng thứ hai | Inline error | *(E-056)* "メイン担当者は1名のみ登録できます。" |
| 7 Business rule | Mã bưu điện không tồn tại | *(không hiển thị gì)* | — *(Figma: "không thực hiện điền, không báo lỗi, giữ giá trị đã nhập")* |
| 8 External | UNKNOWN — Figma không mô tả lỗi service tra cứu mã bưu điện | — | — |

### AW_AGCY_003 — 代理店情報編集

**Happy Case:**
- Layout: giống `AW_AGCY_002` + 3 tab phía dưới (`紹介履歴` / `支払履歴` / `変更履歴`); header có `キャンセル` / `保存`.
- Components: **item định nghĩa giống `AW_AGCY_002`**, cộng thêm:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Button `保存` | Chỉ hiển thị với quyền Update · disable trong lúc lưu · lưu xong lấy lại dữ liệu mới nhất + toast `Đã lưu.` | Lưu → AW_AGCY_004 |
  | Header | Button `キャンセル` | Luôn hiển thị | `[có thay đổi]` → AW_AGCY_006 / `[không]` → AW_AGCY_004 |
  | Body | `代理店ID` | Hiển thị giá trị đã cấp, read-only | — |
  | Body | `備考` | Ở màn này là **Text (sửa được)** | Nhập |
  | Tab | `紹介履歴` | Read-only — xem chi tiết ở `AW_AGCY_004` | — |
  | Tab | `支払履歴` | Read-only — xem chi tiết ở `AW_AGCY_004` | — |
  | Tab | `変更履歴` | Read-only, 3 cột | — |
  | S3 | Button `行を追加` | Hiển thị (chế độ chỉnh sửa) | Thêm dòng lên đầu bảng |
- Interactions: giống `AW_AGCY_002`.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | Toàn bộ rule giống `AW_AGCY_002` (E-027 → E-054) | Inline error | *(tái sử dụng E-027…E-054)* |
| 2 Auth/Permission | Không có quyền Update | Button disabled | — *(nút `保存` không hiển thị)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | Tab không có bản ghi | Empty state | *(E-057)* "表示するデータがありません。" |
| 6 Conflict | Email trùng / Main admin trùng | Inline error | *(tái sử dụng E-055, E-056)* |
| 6 Conflict | Rời màn khi có thay đổi chưa lưu | Modal | *(tái sử dụng E-021)* → AW_AGCY_006 |
| 7 Business rule | Xóa dòng `メイン担当者` | Button disabled | — *(icon 🗑 bị vô hiệu hóa ở dòng Main)* |
| 8 External | UNKNOWN — Figma không mô tả | — | — |

### AW_AGCY_004 — 代理店情報詳細（3 tab）

**Happy Case:**
- Layout: breadcrumb `代理店管理 / 代理店一覧 / 代理店情報詳細` · tiêu đề `代理店情報詳細 {AG_ID}` · header phải có `削除` (viền đỏ) + `編集` (primary) · 3 section read-only · bộ 3 tab ở dưới.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Button `削除` | Chỉ hiển thị với quyền Delete | → AW_AGCY_005 |
  | Header | Button `編集` | Chỉ hiển thị với quyền Update | → AW_AGCY_003 |
  | S1 `代理店情報` | Toàn bộ item đại lý | Read-only | — |
  | S2 `紹介フィープラン` | `紹介フィープラン` · `フィー支払区分` · `フィー算定方式` · `フィー金額・率` · `フィー支払期間` | Read-only | — |
  | S3 `担当者` | Bảng `区分` / `担当者名` / `フリガナ` / `メールアドレス` / `TEL` | Read-only, không có cột thao tác | — |
  | Tab 1 `紹介履歴` | `No` · `紹介ID` (link) · `法人` · `拠点名` (link) · `紹介フィープラン` · `支払区分` · `ステータス` · `算定方式` · `開始月` · `終了予定月` · `終了月` | `紹介ID` → AW_REFE_005 · `拠点名` → Chi tiết chi nhánh |
  | Tab 2 `支払履歴` | `No` · `支払対象月` · `支払いID` (link) · `支払先区分` · `支払先` · `対象件数` · `算定額` · `調整額` · `支払合計額` · `支払状況` · `支払日` | `支払いID` → AW_FEPA_004 |
  | Tab 3 `変更履歴` | `変更日時` (`YYYY/MM/DD HH:mm`) · `変更内容` · `変更者` | — |
  | Footer | Phân trang trong tab | Giống AW_FEPL_001 | Click / Chọn |
- Interactions: cả 3 tab **read-only**, không có cột thao tác, chỉ hiển thị dữ liệu thuộc `代理店ID` đang mở; tab `支払履歴` **không** có dòng tổng cộng; hover tên dài → tooltip.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | N/A — màn read-only | — | — |
| 2 Auth/Permission | Không có quyền Update / Delete | Button disabled | — *(ẩn nút tương ứng)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | Tab `紹介履歴` / `支払履歴` / `変更履歴` có 0 bản ghi | Empty state | *(tái sử dụng E-057)* "表示するデータがありません。" |
| 6 Conflict | UNKNOWN — Figma không mô tả | — | — |
| 7 Business rule | Nhấn `削除` khi đại lý đang được tham chiếu | Toast | *(tái sử dụng E-026)* |
| 8 External | UNKNOWN — Figma không mô tả | — | — |

### AW_AGCY_005 — 削除確認（Popup xác nhận xóa đại lý）

**Happy Case:**
- Layout: Modal overlay 450×316 — cấu trúc giống `AW_FEPL_005`.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Body | Text xác nhận | "Bạn có chắc chắn muốn xóa không? Sau khi xóa sẽ không thể khôi phục." | — |
  | Footer | Button `削除` | — | Xóa → đóng popup |
  | Footer | Button `キャンセル` | — | Đóng popup |
- Interactions: đóng popup sau khi xử lý.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | N/A | — | — |
| 2 Auth/Permission | N/A | — | — |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | Xóa thất bại | Toast | *(tái sử dụng E-023)* "削除に失敗しました。" |
| 5 Empty | N/A | — | — |
| 6 Conflict | UNKNOWN — Figma không mô tả | — | — |
| 7 Business rule | Đại lý đang được tham chiếu | Toast | *(tái sử dụng E-026)* |
| 8 External | N/A | — | — |

### AW_AGCY_006 — 編集破棄（Popup xác nhận hủy chỉnh sửa）

Nội dung, nút bấm, điều kiện bật popup và bảng Non-Happy **giống hệt `AW_FEPL_006`** (Figma dùng chung component `編集破棄` cho cả 4 module). Màn đích khi nhấn `廃棄`: `AW_AGCY_001` (từ màn đăng ký) hoặc `AW_AGCY_004` (từ màn chỉnh sửa), hoặc màn mà user vừa bấm trên menu bên / breadcrumb.

### AW_REFE_001 — 紹介履歴一覧

**Happy Case:**
- Layout: Sidebar (`紹介履歴` active) · page header có `CSV出力` + `＋新規登録` · panel lọc 7 điều kiện · bảng danh sách 15 cột · phân trang.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Page header | Button `＋新規登録` | Chỉ hiển thị với quyền Create | → AW_REFE_002 |
  | Page header | Button `CSV出力` | Tải xuống dữ liệu đang hiển thị theo điều kiện lọc hiện tại · điều kiện hiển thị: UNKNOWN (OQ-04) | Click |
  | Search | `検索テキスト` (Text) | Khớp một phần trên 5 trường (Tên/ID đại lý · Tên/ID pháp nhân · ID giới thiệu), điều kiện **OR**; trống = toàn bộ | Nhập |
  | Search | `紹介フィープラン` (Dropdown) | Chỉ gói `有効`; chưa chọn = không lọc | Chọn |
  | Search | `支払区分` (Dropdown) | Đề xuất 2 lựa chọn `単発` / `連続` — xem OQ-07 | Chọn |
  | Search | `ステータス` (Dropdown) | 3 lựa chọn: `契約中` / `満了` / `途中解約` | Chọn |
  | Search | `フィー算定方式` (Dropdown) | 3 lựa chọn: `固定額` / `月次提供回の金額` / `請求額割合` | Chọn |
  | Search | `開始月` (Month picker) | Placeholder `開始月` + icon lịch · `yyyy年mm月` · lọc theo cột Tháng bắt đầu | Chọn |
  | Search | `終了月` (Month picker) | Placeholder `終了月` + icon lịch · lọc theo cột Tháng kết thúc · chưa chọn = không lọc | Chọn |
  | Search | `クリア` / `検索` / `並べ替え` | Xóa điều kiện / thực thi tìm kiếm / mở panel sắp xếp | Click |
  | Table | `紹介ID` (text link) | `REF` + 6 số, VD `REF000005` | → AW_REFE_005 |
  | Table | `紹介元` | Tên đại lý hoặc pháp nhân nguồn; vượt cột → `…` + tooltip | Hover |
  | Table | `紹介元区分` | `法人` / `代理店` | — |
  | Table | `紹介先法人ID-法人名` | Gộp 1 cột: `{CU+6 số} {Tên pháp nhân}` | Hover |
  | Table | `拠点名` | Tên chi nhánh (text, không link ở màn này) | Hover |
  | Table | `契約ID` (text link) | `CP` + 6 số, VD `CP000001` | → Chi tiết hợp đồng |
  | Table | `紹介フィープラン` | Tên gói đã đăng ký trong Master phí | — |
  | Table | `支払区分` | `単発` / `連続` | — |
  | Table | `ステータス` | `契約中` / `満了` / `途中解約` | — |
  | Table | `フィー算定方式` | `固定額` / `プラン別` / `請求額割合` (`プラン別` ↔ `月次提供回の金額`) | — |
  | Table | `開始月` · `終了予定月` · `終了月` | `yyyy年mm月`; trống có ý nghĩa riêng (xem Edge Case E) | — |
  | Table | Icon ✏ | Chỉ quyền Update | → AW_REFE_003 hoặc AW_REFE_004 |
  | Table | Icon 🗑 | Chỉ quyền Delete | → AW_REFE_006 |
  | Footer | Phân trang | Giống AW_FEPL_001 | Click / Chọn |
- Interactions: hover tên dài → tooltip toàn văn.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | N/A — màn danh sách, chỉ có điều kiện lọc | — | — |
| 2 Auth/Permission | Không có quyền Create/Update/Delete | Button disabled | — *(ẩn nút/icon tương ứng)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | UNKNOWN — Figma không mô tả empty state cho danh sách này | — | — |
| 6 Conflict | UNKNOWN — Figma không mô tả | — | — |
| 7 Business rule | Xóa bản ghi có `ステータス = 契約中` **hoặc** đã phát sinh Lịch sử thanh toán | Toast | *(E-058)* Nội dung message: UNKNOWN — Figma chỉ ghi "hiển thị toast lỗi" |
| 8 External | Xuất CSV thất bại | Toast | *(E-059)* "Xuất CSV thất bại. Vui lòng thử lại" |

### AW_REFE_002 — 紹介履歴登録

**Happy Case:**
- Layout: 2 section — `紹介基本情報` · `紹介フィープラン`; header có `キャンセル` / `登録`.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Button `キャンセル` | Cùng thông số với `AW_AGCY_002` | `[đã nhập]` → AW_REFE_007 |
  | Header | Button primary `登録` | Chỉ quyền Create · disable trong lúc lưu · lưu xong toast `Đã lưu.` | Submit → AW_REFE_001 |
  | S1 | `紹介ID` (read-only) | Trống + placeholder `紹介ID`; cấp khi đăng ký xong (`REF`+6 số) | — |
  | S1 | `紹介元区分` (Radio) | ✅ Bắt buộc · `代理店` / `法人` · mặc định `代理店` | Chọn → enable/disable 1.3, 1.4 |
  | S1 | `代理店` (Dropdown) | ✅ Bắt buộc khi 紹介元区分 = `代理店` · chỉ đại lý `有効` · chọn → tự điền Section 2 | Chọn |
  | S1 | `紹介元法人ID・法人名` (Dropdown) | ✅ Bắt buộc khi 紹介元区分 = `法人` · chỉ pháp nhân `有効` · `{CU+6 số} {Tên}` | Chọn |
  | S1 | `紹介先契約ID` (Dropdown) | ✅ Bắt buộc · chỉ hợp đồng ① Hiệu lực ② chưa liên kết lịch sử giới thiệu · chọn → tự điền 1.6, 1.7 | Chọn |
  | S1 | `紹介先法人ID・法人名` (read-only) | ✅ Bắt buộc (thỏa mãn tự động) · disable khi chưa chọn hợp đồng | — |
  | S1 | `紹介先拠点ID・拠点名` (read-only) | ✅ Bắt buộc (thỏa mãn tự động) · disable khi chưa chọn hợp đồng | — |
  | S1 | `契約開始年月` (Month picker) | ✅ Bắt buộc · `yyyy年mm月` · nhập tay (không tự điền từ hợp đồng) | Chọn |
  | S1 | `支払い開始年月` (Month picker) | ✅ Bắt buộc · `yyyy年mm月` · phải ≥ `契約開始年月` | Chọn |
  | S1 | `備考` (Text) | Tùy chọn | Nhập |
  | S2 | `紹介フィープラン` (Dropdown) | ✅ Bắt buộc · tự điền từ đại lý được chọn ở 1.3 | Chọn |
  | S2 | `フィー支払区分` (read-only) | `単発` / `連続` | — |
  | S2 | `フィー算定方式` (read-only) | `固定額` / `プラン別` / `請求額割合` | — |
  | S2 | `フィー金額・率` (read-only) | Hiển thị theo phương thức tính | — |
  | S2 | `フィー支払期間` (read-only) | Chỉ hiển thị khi 支払区分 = `継続（ヶ月）`; dùng để tính `終了予定月` | — |
- Interactions: đổi `紹介元区分` → dropdown đối lập bị xóa giá trị + disable; đổi hợp đồng → 1.6/1.7 tự ghi đè.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | `紹介元区分` chưa chọn | Inline error | *(E-060)* "紹介元区分を選択してください。" |
| 1 Validation | `代理店` chưa chọn (khi nguồn = 代理店) | Inline error | *(E-061)* "代理店を選択してください。" |
| 1 Validation | `紹介元法人` chưa chọn (khi nguồn = 法人) | Inline error | *(E-062)* "紹介元法人を選択してください。" |
| 1 Validation | `紹介先契約ID` chưa chọn | Inline error | *(E-063)* "紹介先契約IDを選択してください。" |
| 1 Validation | `契約開始年月` chưa chọn | Inline error | *(E-064)* "契約開始年月を選択してください。" |
| 1 Validation | `支払い開始年月` chưa chọn | Inline error | *(E-065)* "支払い開始年月を選択してください。" |
| 1 Validation | Toàn bộ mục bắt buộc chưa nhập đủ khi nhấn `登録` | Inline error | *(E-066)* "必須項目が全て入力済みであるこ" *(nguyên văn Figma — chuỗi bị cắt, cần sửa: OQ-15)* |
| 2 Auth/Permission | Không có quyền Create | Button disabled | — *(nút `登録` không hiển thị)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | UNKNOWN — Figma không mô tả trường hợp không còn hợp đồng khả dụng | — | — |
| 6 Conflict | Hợp đồng đã được đăng ký lịch sử giới thiệu khác | Inline error | *(E-067)* "この契約IDは既に紹介履歴に登録されています。" |
| 7 Business rule | `支払い開始年月` < `契約開始年月` | Inline error | *(E-068)* "支払い開始年月は契約開始年月以降の年月を選択してください。" |
| 8 External | UNKNOWN — Figma không mô tả | — | — |

### AW_REFE_003 — 紹介履歴編集（紹介元 = 代理店）

**Happy Case:**
- Layout: giống `AW_REFE_002` + `変更情報テーブル`; header có `キャンセル` / `保存`.
- Components: **item định nghĩa giống `AW_REFE_002`** với `紹介元区分` = `代理店` (dropdown `代理店` active, dropdown `法人` disable). Bổ sung:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Button `保存` | Chỉ quyền Update · disable trong lúc lưu · toast `Đã lưu.` | Lưu → AW_REFE_005 |
  | Header | Button `キャンセル` | Luôn hiển thị | `[có thay đổi]` → AW_REFE_007 |
  | Body | `紹介ID` | Hiển thị giá trị đã cấp, read-only | — |
  | Footer | `変更情報テーブル` | 3 cột, mới nhất trước, read-only | — |
- Interactions: giống `AW_REFE_002`.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | Toàn bộ rule giống `AW_REFE_002` (E-060 → E-066) | Inline error | *(tái sử dụng E-060…E-066)* |
| 2 Auth/Permission | Không có quyền Update | Button disabled | — *(nút `保存` không hiển thị)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | Chưa có bản ghi trong `変更情報テーブル` | Empty state | *(tái sử dụng E-057)* |
| 6 Conflict | Đổi sang hợp đồng đã có lịch sử giới thiệu | Inline error | *(tái sử dụng E-067)* |
| 6 Conflict | Rời màn khi có thay đổi chưa lưu | Modal | *(tái sử dụng E-021)* → AW_REFE_007 |
| 7 Business rule | `支払い開始年月` < `契約開始年月` | Inline error | *(tái sử dụng E-068)* |
| 8 External | UNKNOWN — Figma không mô tả | — | — |

### AW_REFE_004 — 紹介履歴編集（紹介元 = 法人）

**Happy Case:**
- Layout: giống `AW_REFE_003`, khác ở `紹介元区分` = `法人` → dropdown `紹介元法人ID・法人名` active, dropdown `代理店` bị xóa giá trị + disable.
- Components: **item định nghĩa giống `AW_REFE_002`**; điểm khác duy nhất theo Figma là trạng thái enable/disable của cặp dropdown 1.3 / 1.4.
- Interactions: giống `AW_REFE_003`.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | Toàn bộ rule giống `AW_REFE_002`, trong đó `紹介元法人` là trường bắt buộc thay cho `代理店` | Inline error | *(tái sử dụng E-060, E-062…E-066)* |
| 2 Auth/Permission | Không có quyền Update | Button disabled | — |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | Chưa có bản ghi trong `変更情報テーブル` | Empty state | *(tái sử dụng E-057)* |
| 6 Conflict | Đổi sang hợp đồng đã có lịch sử giới thiệu | Inline error | *(tái sử dụng E-067)* |
| 6 Conflict | Rời màn khi có thay đổi chưa lưu | Modal | *(tái sử dụng E-021)* → AW_REFE_007 |
| 7 Business rule | `支払い開始年月` < `契約開始年月` | Inline error | *(tái sử dụng E-068)* |
| 8 External | UNKNOWN — Figma không mô tả | — | — |

> ⚠️ **Lý do tách `AW_REFE_003` / `AW_REFE_004` (Test C):** Figma định nghĩa 2 frame riêng biệt (`29419:271019` và `29419:271141`) với tên gọi phân biệt rõ nguồn giới thiệu. Giữ tách để khớp 1-1 với design thật, mặc dù khác biệt về cấu trúc chỉ nằm ở cặp dropdown 1.3 / 1.4.

### AW_REFE_005 — 紹介履歴詳細

**Happy Case:**
- Layout: giống `AW_REFE_003` nhưng toàn bộ item read-only; header có `編集`; dưới cùng là `変更情報テーブル`.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Button `編集` | Chỉ quyền Update | → AW_REFE_003 hoặc AW_REFE_004 theo `紹介元区分` |
  | Body | Toàn bộ item Section 1 + Section 2 | Read-only | — |
  | Footer | `変更情報テーブル` | 3 cột, mới nhất trước | — |
- Interactions: UNKNOWN — Figma không mô tả thêm.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | N/A — màn read-only | — | — |
| 2 Auth/Permission | Không có quyền Update | Button disabled | — *(ẩn nút `編集`)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | Chưa có bản ghi trong `変更情報テーブル` | Empty state | *(tái sử dụng E-057)* |
| 6 Conflict | UNKNOWN — Figma không mô tả | — | — |
| 7 Business rule | UNKNOWN — Figma không mô tả rule chặn ở màn chi tiết | — | — |
| 8 External | UNKNOWN — Figma không mô tả | — | — |

### AW_REFE_006 — 削除確認（Popup xác nhận xóa lịch sử giới thiệu）

Nội dung, nút bấm và bảng Non-Happy **giống `AW_FEPL_005`** (Figma dùng chung component `削除確認`). Khác biệt duy nhất: điều kiện chặn xóa là ① `ステータス = 契約中` hoặc ② đã phát sinh Lịch sử thanh toán → Toast lỗi *(tái sử dụng E-058)*.

### AW_REFE_007 — 編集破棄（Popup xác nhận hủy chỉnh sửa）

Nội dung, nút bấm, điều kiện bật popup và bảng Non-Happy **giống hệt `AW_FEPL_006`**. Màn đích khi nhấn `廃棄`: `AW_REFE_001` (từ màn đăng ký) hoặc `AW_REFE_005` (từ màn chỉnh sửa).

### AW_FEPA_001 — 支払履歴一覧

**Happy Case:**
- Layout: Sidebar (`支払履歴` active) · page header có `CSV出力` (**không có** nút `＋新規登録` — bản ghi do batch sinh) · panel lọc 6 điều kiện · bảng 13 cột · phân trang.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Page header | Button `CSV出力` | Tải xuống dữ liệu theo điều kiện lọc hiện tại · điều kiện hiển thị: UNKNOWN (OQ-04) | Click |
  | Search | `検索テキスト` (Text) | Khớp một phần trên 2 trường (`支払先名` · `支払いID`), điều kiện **OR**; trống = toàn bộ | Nhập |
  | Search | `紹介フィープラン` (Dropdown) | Chỉ gói `有効`; chưa chọn = không lọc | Chọn |
  | Search | `支払区分` (Dropdown) | `単発` / `連続`; chưa chọn = không lọc | Chọn |
  | Search | `支払状況` (Dropdown) | `未払い` / `支払い済み` / `対象外`; chưa chọn = không lọc | Chọn |
  | Search | `フィー算定方式` (Dropdown) | 3 lựa chọn; chưa chọn = không lọc | Chọn |
  | Search | `支払対象月` (Month picker) | `yyyy年mm月` · quy tắc: `支払対象月` = tháng chạy batch | Chọn |
  | Search | `クリア` / `検索` / `並べ替え` | Xóa điều kiện / tìm kiếm / mở panel sắp xếp (mặc định `支払対象月` giảm dần, sau khi sắp xếp về trang 1) | Click |
  | Table | `支払対象月` | `yyyy年mm月` | — |
  | Table | `支払いID` (text link) | `FP` + `yyyymm` + `-` + 4 số, VD `FP202608-0001` | → AW_FEPA_004 |
  | Table | `支払先区分` | `法人` / `代理店` | — |
  | Table | `支払先` | Tên pháp nhân hoặc đại lý; vượt cột → `…` + tooltip | Hover |
  | Table | `処理方法` | `振込` / `請求相殺` · giá trị do admin chọn ở màn chỉnh sửa | — |
  | Table | `対象件数` | Số hồ sơ giới thiệu được tính phí trong tháng | — |
  | Table | `算定合計額` | Dấu phẩy 3 chữ số + `円`, VD `86,300円` | — |
  | Table | `調整合計額` | Cho phép âm (VD `-2,800円`); không có điều chỉnh → `0円` | — |
  | Table | `支払合計額` | = `算定合計額` + `調整合計額` | — |
  | Table | `支払状況` | `未払い` / `支払済み` / `対象外` · batch khởi tạo = `未払い` | — |
  | Table | `支払日` | `yyyy/mm/dd`; trống khi `支払状況 = 未払い` | — |
  | Table | Icon ✏ | Chỉ quyền Update | → AW_FEPA_002 hoặc AW_FEPA_003 |
  | Footer | Phân trang | Giống AW_FEPL_001 | Click / Chọn |
- Interactions: **không có icon 🗑** — bản ghi không xóa được; hover tên dài → tooltip.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | N/A — màn danh sách, chỉ có điều kiện lọc | — | — |
| 2 Auth/Permission | Không có quyền Update | Button disabled | — *(ẩn icon ✏)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | UNKNOWN — Figma không mô tả empty state cho danh sách này | — | — |
| 6 Conflict | UNKNOWN — Figma không mô tả | — | — |
| 7 Business rule | Nhấn ✏ trên dòng có `支払状況 = 支払済み` | Toast | *(E-069)* "支払済みの支払履歴は編集できません。" |
| 8 External | Xuất CSV thất bại | Toast | *(tái sử dụng E-059)* "Xuất CSV thất bại. Vui lòng thử lại" |

### AW_FEPA_002 — フィー支払履歴編集（支払先 = 代理店）

**Happy Case:**
- Layout: 3 section — `支払基本情報` (read-only) · `紹介フィー` (gồm 4 thẻ tổng hợp) · `紹介フィー内訳` (accordion, mặc định mở); header có `キャンセル` / `保存`.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Button `キャンセル` | Luôn hiển thị | `[có thay đổi]` → AW_FEPA_005 / `[không]` → AW_FEPA_004 |
  | Header | Button `保存` | Chỉ quyền Update · disable trong lúc lưu · **lưu xong giữ nguyên màn này** + toast hoàn tất | Lưu |
  | S1 | `支払いID` (read-only) | `FP` + `yyyymm` + `-` + 4 số | — |
  | S1 | `支払対象月` (read-only) | `yyyy年MM月` (tháng 2 chữ số, VD `2026年08月`) | — |
  | S1 | `支払先区分` (read-only) | `代理店` — batch tự set từ `紹介元区分` | — |
  | S1 | `支払先` (read-only) | Tên đại lý — batch tự set | — |
  | S1 | `対象件数` (read-only) | Khớp với số dòng Section 3 | — |
  | S2 | `支払状況` (Radio) | ✅ Bắt buộc · `未払い` / `支払済み` / `対象外` · batch khởi tạo `未払い` | Chọn → set/ẩn `支払日` |
  | S2 | `支払日` (Date picker) | ✅ Bắt buộc khi `支払状況 = 支払済み` · `yyyy/mm/dd` · tự set ngày hiện tại khi chuyển sang `支払済み` · **ẩn** khi `対象外` | Chọn / Tự động |
  | S2 | `処理方法` (Dropdown) | ✅ Bắt buộc · `振込` / `請求相殺` · batch set mặc định `振込` cho đại lý · admin đổi được | Chọn |
  | S2 | Thẻ `算定対象額合計` (read-only) | Chú thích `※フィー計算の元になった請求額の合計` · tổng cột `算定対象額` · VD `1,112,000 円` | — |
  | S2 | Thẻ `算定合計額` (read-only) | Chú thích `※フィーとして算定された金額の合計` · VD `186,800 円` | — |
  | S2 | Thẻ `調整合計額` (read-only) | Chú thích `※紹介フィー内訳で入力された調整額` · cho phép âm · tính lại real-time | — |
  | S2 | Thẻ `支払合計額` (read-only) | Chữ màu xanh nhấn mạnh · = `算定合計額` + `調整合計額` · real-time | — |
  | S2 | `備考` (Textarea) | Tùy chọn · nhiều dòng | Nhập |
  | S3 | Bảng `紹介フィー内訳` | `No` · `紹介ID` (link) · `紹介先法人` · `拠点名` (link) · `紹介フィープラン` · `支払区分` · `算定方式` · `算定対象額` · `フィー金額・率` · `算定額` · **`調整額` (nhập được)** · `支払額` | `紹介ID` → AW_REFE_005 · `拠点名` → Chi tiết chi nhánh |
- Interactions: không thêm/xóa/sắp xếp dòng Section 3; không phân trang (hiển thị toàn bộ); nhập `調整額` → real-time cập nhật `支払額` dòng + `調整合計額` + `支払合計額`; số toàn chiều rộng tự chuyển half-width; tự thêm dấu phẩy + `円` khi mất focus.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | `支払状況` chưa chọn | Inline error | *(E-070)* "支払状況を選択してください。" |
| 1 Validation | `処理方法` chưa chọn | Inline error | *(E-071)* "処理方法を選択してください。" |
| 1 Validation | `調整額` ngoài phạm vi −9.999.999 ~ 9.999.999 | Inline error | *(E-072)* "調整額は-9,999,999〜9,999,999の範囲で入力してください。" |
| 1 Validation | `調整額` sai định dạng (không phải số nguyên half-width) | Inline error | *(E-073)* "調整額は半角数字（整数）で入力してください。" |
| 1 Validation | `支払日` trống khi `支払状況 = 支払済み` | Inline error | *(E-074)* Nội dung message: UNKNOWN — Figma chỉ ghi ràng buộc bắt buộc, không ghi message |
| 2 Auth/Permission | Không có quyền Update | Button disabled | — *(nút `保存` không hiển thị)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | UNKNOWN — Figma không mô tả trường hợp Section 3 rỗng | — | — |
| 6 Conflict | Rời màn khi có thay đổi chưa lưu | Modal | *(tái sử dụng E-021)* → AW_FEPA_005 |
| 7 Business rule | `支払状況` = `支払済み` hoặc `対象外` | Button disabled | — *(cột `調整額` bị vô hiệu hóa)* |
| 8 External | UNKNOWN — Figma không mô tả | — | — |

### AW_FEPA_003 — フィー支払履歴編集（支払先 = 法人）

**Happy Case:**
- Layout và toàn bộ item **giống `AW_FEPA_002`**. Khác biệt duy nhất theo Figma:
  | Vị trí | Component | Nội dung khác biệt |
  |---|---|---|
  | S1 | `支払先区分` | Giá trị = `法人` (thay vì `代理店`) |
  | S1 | `支払先` | Tên pháp nhân nguồn giới thiệu |
  | S2 | `処理方法` | Batch set mặc định = `請求相殺` (thay vì `振込`); admin vẫn đổi được |
- Interactions: giống `AW_FEPA_002`.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | Toàn bộ rule giống `AW_FEPA_002` (E-070 → E-074) | Inline error | *(tái sử dụng E-070…E-074)* |
| 2 Auth/Permission | Không có quyền Update | Button disabled | — |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | UNKNOWN — Figma không mô tả | — | — |
| 6 Conflict | Rời màn khi có thay đổi chưa lưu | Modal | *(tái sử dụng E-021)* → AW_FEPA_005 |
| 7 Business rule | `支払状況` = `支払済み` hoặc `対象外` | Button disabled | — *(cột `調整額` bị vô hiệu hóa)* |
| 8 External | UNKNOWN — Figma không mô tả | — | — |

### AW_FEPA_004 — フィー支払履歴詳細

**Happy Case:**
- Layout: giống `AW_FEPA_002` nhưng toàn bộ item read-only (kể cả cột `調整額`); header có `編集`; dưới cùng là `変更情報テーブル`.
- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Button `編集` | Chỉ quyền Update | → AW_FEPA_002 hoặc AW_FEPA_003 theo `支払先区分` |
  | Body | Section 1 + 2 + 3 | Read-only | `紹介ID` → AW_REFE_005 · `拠点名` → Chi tiết chi nhánh |
  | Footer | `変更情報テーブル` | 3 cột, mới nhất trước | — |
- Interactions: UNKNOWN — Figma không mô tả thêm.
- Animation đề xuất: UNKNOWN — Figma không mô tả.

**Non-Happy Case:**
| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation | N/A — màn read-only | — | — |
| 2 Auth/Permission | Không có quyền Update | Button disabled | — *(ẩn nút `編集`)* |
| 3 Network | UNKNOWN — Figma không mô tả | — | — |
| 4 Server error | UNKNOWN — Figma không mô tả | — | — |
| 5 Empty | Chưa có bản ghi trong `変更情報テーブル` | Empty state | *(tái sử dụng E-057)* |
| 6 Conflict | UNKNOWN — Figma không mô tả | — | — |
| 7 Business rule | Nhấn `編集` khi `支払状況 = 支払済み` | Toast | *(tái sử dụng E-069)* |
| 8 External | UNKNOWN — Figma không mô tả | — | — |

### AW_FEPA_005 — 編集破棄（Popup xác nhận hủy chỉnh sửa）

Nội dung, nút bấm, điều kiện bật popup và bảng Non-Happy **giống hệt `AW_FEPL_006`**. Màn đích khi nhấn `廃棄`: `AW_FEPA_004` hoặc màn user vừa bấm trên menu bên / breadcrumb.

> **Lưu ý:** module `AW_FEPA` **không có** popup `削除確認` vì Figma không định nghĩa chức năng xóa cho lịch sử thanh toán.

---

## Responsive Requirements

`TARGET_PLATFORM` = **Website (desktop)** — suy ra từ chính Figma: toàn bộ 17 frame màn chính có `width = 1440`.

| Breakpoint | Screen size (W×H) | Layout changes |
|---|---|---|
| Website (desktop) | 1440×1024 | Layout chuẩn — sidebar cố định 210px bên trái + vùng nội dung 1230px. Đây là **kích thước duy nhất** Figma cung cấp. |

**Quy tắc chung (trích từ Figma):**

- **Navigation:** sidebar trái cố định, rộng `210px`, nhóm `代理・紹介管理` mở sẵn với 4 mục con (`紹介フィーマスタ` · `代理店マスタ` · `紹介履歴` · `支払履歴`); mục đang mở được highlight nền xanh.
- **Vùng nội dung:** frame `Container` rộng `1230px`, bên trong `Wrap` + `.Page-Header(Legacy)` rộng `1182px` (padding trái/phải 24px).
- **Header:** thanh trên cùng cao `54px`, chứa logo ESSTATION, lời chào và menu tài khoản.
- **Breadcrumb:** nằm trong page header, phía trên tiêu đề màn hình.
- **Modal:** `削除確認` và `編集破棄` đều có kích thước `450×316`.
- **Toast:** kích thước `384×48`.

> ⚠️ **Không có breakpoint mobile / tablet trong Figma.** BA **không** tự suy ra breakpoint khác — nếu dự án cần responsive, đây là hạng mục thiếu design, phải quay lại Designer.

---

## Open Questions

> Tất cả mục dưới đây là `UNKNOWN` / `CONFLICT` trong `## Source Register`. **Không mục nào được nối vào Happy Path hoặc AC.** Cần BrSE / khách hàng quyết định trước khi Tech Lead chốt Design-Technical.

| ID | Câu hỏi | Nguồn trong Figma | Ảnh hưởng nếu chưa chốt |
|---|---|---|---|
| **OQ-03** 🔴 | Nút `CSV出力` ở `AW_AGCY_001` là **xuất** CSV hay **nhập** CSV? Nhãn nút ghi `CSV出力` (xuất) nhưng mô tả ghi "Tải lên file CSV để đăng ký・cập nhật dữ liệu hàng loạt" (nhập). | `30079:156426` H.8 | **Blocking** — quyết định có cần API import + validate file + màn preview hay không. Chênh lệch estimate lớn. |
| **OQ-12** 🔴 | Nhãn panel 2.6 trong mockup hiển thị `月次提供回の金額` nhưng đúng phải là `請求額割合`. Figma ghi rõ "実装バグとして修正が必要". | `30062:155320` 2.6 | Cần Designer sửa mockup trước khi FE code, tránh code theo nhãn sai. |
| **OQ-10** 🔴 | Cách cập nhật trạng thái sau khi kỳ hạn thanh toán (VD 36 tháng) mãn hạn và đã chi trả xong? Công thức `有効紹介数 = 紹介合計数 − ① − ②` (① = mãn hạn, ② = đã hủy) áp dụng ở đâu? | Text node `29419:271727` | Ảnh hưởng logic batch + cột thống kê ở `AW_AGCY_001`. Hiện `有効紹介数` **chưa** có trong bảng danh sách nào. |
| OQ-01 | Cột `No` có đánh số liên tục xuyên trang không (trang 2 bắt đầu từ No.11)? | `30033:237981` L.1 · `30079:156427` 1.1 (`要確認`) | Ảnh hưởng cách FE render + TC phân trang. |
| OQ-02 | Dropdown "Số dòng/trang" có những lựa chọn nào (ngoài mặc định 10)? | `30033:237982` P.3 | Ảnh hưởng API `limit` + TC. |
| OQ-04 | Điều kiện hiển thị nút `CSV出力` ở `AW_REFE_001` và `AW_FEPA_001` là gì (quyền nào)? | `30177:167134` H.8 · `30148:165789` H.3 ("Cần xác nhận") | Ảnh hưởng ma trận phân quyền. |
| OQ-05 | Bản ghi đại lý đã xóa có hiển thị trong danh sách `AW_AGCY_001` không? | `30079:156427` 1.9 | Quyết định soft-delete vs hard-delete. |
| OQ-06 | Khóa sắp xếp của `AW_AGCY_001` gồm những trường nào? (Figma mới ở mức đề xuất: ID / Tên (50 âm) / Tổng số giới thiệu / Số đối tượng thanh toán / Số đang trong hợp đồng) | `30079:156426` S.6 | Ảnh hưởng API sort + index DB. |
| OQ-07 | Filter `支払区分` ở `AW_REFE_001` có 2 giá trị (`単発`/`連続`) — có đồng bộ với 3 giá trị của Master phí (`単発`/`継続（ヶ月）`/`継続（永続）`) không? | `30177:167134` S.3 | Ảnh hưởng mapping enum giữa 2 module. |
| OQ-08 | Định nghĩa "hệ thống mã" của gói phí hiển thị dạng `{mã}：{tên gói}` (VD `B：代理店紹介`) là gì? Master phí hiện **không có** cột mã. | `30101:160272` A-1.5 | Có thể phải bổ sung cột mã vào Master phí. |
| OQ-09 | `算定合計額` là số tiền **đã gồm thuế** hay **chưa gồm thuế**? | `30148:165790` L.8 | Ảnh hưởng công thức tính phí và đối soát kế toán. |
| OQ-11 | Khi chuyển `紹介元区分` ở `AW_REFE_002`, gói phí ở Section 2 có bị xóa giá trị không? | `30101:161875` 2.1 | Ảnh hưởng hành vi form. |
| OQ-13 | Các ngưỡng MIN/MAX Figma đánh dấu `（提案／要確認）`: `支払先` 100 ký tự · `算定対象額` 0–9.999.999 · `算定額` 0–9.999.999. | `30134:163792` 1.4 · `30134:163793` 3.8/3.10 | Ảnh hưởng validation + kiểu dữ liệu DB. |
| OQ-14 | **Figma không định nghĩa hành vi cho 3 nhóm lỗi hệ thống:** ③ Network (mất mạng/timeout) · ④ Server error (500/maintenance) · ⑤ Empty state cho các màn danh sách chính (`AW_FEPL_001`, `AW_AGCY_001`, `AW_REFE_001`, `AW_FEPA_001`). Chỉ tab trong `AW_AGCY_004` có empty message. | Toàn bộ 31 bảng spec | Cần thống nhất pattern chung toàn hệ thống admin, nếu không mỗi FE sẽ tự làm một kiểu. |
| OQ-15 | Message `"必須項目が全て入力済みであるこ"` ở `AW_REFE_002` bị **cắt cụt** (thiếu `と`). Nội dung đúng là gì? | `30101:161875` H.3 | Text hiển thị cho user đang sai chính tả. |
| OQ-16 | Nút bị chặn quyền thì **ẩn** hay **disable**? Figma ghi "(ẩn hay disable: cần xác nhận)". | `30033:237981` H.1 | Ảnh hưởng toàn bộ AC-01 và TC phân quyền. |

---

## UX Review Notes

**UX:**
- Luồng dài nhất là Story 5 (Đăng ký đại lý): 6 bước với 3 section và bảng người phụ trách động — vẫn nằm trong 1 màn hình duy nhất, không bắt user đi qua wizard nhiều bước. Đánh giá: hợp lý.
- Điểm mạnh: `AW_AGCY_002` tự điền địa chỉ từ mã bưu điện và tự sinh Katakana — giảm đáng kể thao tác nhập tay. `AW_REFE_002` tự điền pháp nhân + chi nhánh từ hợp đồng, không bắt user nhập lại dữ liệu đã có.
- **Đề xuất cần xác nhận (không tự sửa SPEC):** `AW_FEPA_002` lưu xong **giữ nguyên** màn chỉnh sửa, trong khi 3 module còn lại đều quay về danh sách. Sự thiếu nhất quán này có chủ đích (admin thường sửa `調整額` nhiều dòng liên tiếp) hay là sót? → nên hỏi BrSE.
- **Đề xuất cần xác nhận:** xóa dòng Sub admin ở `AW_AGCY_002` **không có** dialog xác nhận, trong khi xóa dòng bậc số lượng ở `AW_FEPL_002` **có**. Nên thống nhất.

**Information Design:**
- Thứ tự cột trong các bảng danh sách đi từ định danh → phân loại → số liệu → trạng thái → thao tác. Hợp lý, không cần đổi.
- Ba chỉ số ở `AW_AGCY_001` (`紹介合計数` / `支払対象数` / `現在契約中`) có định nghĩa rất gần nhau và dễ nhầm. Figma đã mô tả rõ trong spec table nhưng **trên UI không có tooltip giải thích** → đề xuất bổ sung tooltip, cần Designer xác nhận.
- Việc dùng ô trống mang ngữ nghĩa (`終了予定月` trống = vĩnh viễn, `終了月` trống = đang tiếp diễn, `支払日` trống = chưa thanh toán) là **ngầm định**, người dùng mới khó đoán. Đề xuất hiển thị ký hiệu rõ ràng — cần xác nhận với khách.
- Error message hiện **trộn 2 ngôn ngữ**: phần lớn là tiếng Nhật, một số ít là tiếng Việt (`"Vui lòng nhập tên gói phí"`, `"Ghi chú không được vượt quá 255 ký tự"`, `"Định dạng CSV không đúng..."`). Cần chốt 1 ngôn ngữ hiển thị duy nhất.

**Performance:**
- `AW_FEPA_002` Section 3 hiển thị **toàn bộ** hồ sơ giới thiệu trong tháng, **không phân trang** (Figma ghi rõ). Với đại lý lớn, số dòng có thể rất cao và mỗi lần nhập `調整額` đều tính lại real-time toàn bảng → **rủi ro hiệu năng thực sự**. Cần xác nhận ngưỡng `対象件数` tối đa dự kiến.
- Các màn danh sách đều có phân trang mặc định 10 dòng/trang — an toàn.
- Ba chỉ số tổng hợp ở `AW_AGCY_001` được "tự động tổng hợp bằng cách tham chiếu dữ liệu màn hình Lịch sử giới thiệu" → nếu tính runtime trên mỗi lần load danh sách sẽ tạo N+1 query. Đề xuất Tech Lead cân nhắc materialized view hoặc cột thống kê, **không** thuộc phạm vi SPEC.

---

## Phụ lục A — Mapping SPEC cũ ↔ SPEC mới

> Dùng để QC đối chiếu khi quyết định regenerate 125 TC của `agency-management`. **BA không tự sửa bộ TC đó.**

| Screen code cũ (`agency-management`) | Tên cũ | Screen code mới | Ghi chú |
|---|---|---|---|
| `AW_AGCY_001` | Danh sách Đại lý & Đối tác | `AW_AGCY_001` | ✅ Trùng nghĩa — cùng là màn danh sách đại lý |
| `AW_AGCY_002` | Đăng ký Đại lý Mới | `AW_AGCY_002` | ✅ Trùng nghĩa |
| `AW_AGCY_003` | Agency Detail — Basic Information tab | `AW_AGCY_004` (Section 1 `代理店情報`) | ⚠️ **Code va chạm** — `AW_AGCY_003` ở SPEC mới là màn **Chỉnh sửa** |
| `AW_AGCY_004` | Agency Detail — Contract & Compensation tab | `AW_AGCY_004` (Section 2 `紹介フィープラン`) | ⚠️ Không còn là tab riêng, trở thành section |
| `AW_AGCY_005` | Agency Detail — Performance Summary tab | — | ❌ **Không có trong Figma** |
| `AW_AGCY_006` | Agency Detail — Referral History tab | `AW_AGCY_004` (Tab 1 `紹介履歴`) | ✅ Còn, dạng tab |
| `AW_AGCY_007` | Agency Detail — Payment History tab | `AW_AGCY_004` (Tab 2 `支払履歴`) | ✅ Còn, dạng tab |
| `AW_AGCY_008` | Danh sách Cơ hội Giới thiệu | `AW_REFE_001` | ✅ Đổi prefix |
| `AW_AGCY_009` | Chi tiết / Chỉnh sửa Cơ hội Giới thiệu | `AW_REFE_003` / `AW_REFE_004` / `AW_REFE_005` | ⚠️ Tách thành 3 màn |
| `AW_AGCY_010` | Doanh số theo Đại lý | — | ❌ **Không có trong Figma** |
| `AW_AGCY_011` | Danh sách Thanh toán Hoa hồng | `AW_FEPA_001` | ✅ Đổi prefix |
| `AW_AGCY_012` | Cập nhật Trạng thái Thanh toán *(inferred)* | `AW_FEPA_002` / `AW_FEPA_003` | ⚠️ Là màn riêng, không phải modal như SPEC cũ suy đoán |
| `AW_AGCY_013` | Dashboard Hiệu suất Giới thiệu | — | ❌ **Không có trong Figma** |
| — | *(không có ở SPEC cũ)* | `AW_FEPL_001`–`AW_FEPL_006` | 🆕 **Module Master phí giới thiệu hoàn toàn mới** |
| — | *(không có ở SPEC cũ)* | `AW_REFE_002` | 🆕 Màn đăng ký lịch sử giới thiệu |
| — | *(không có ở SPEC cũ)* | `AW_FEPA_004` | 🆕 Màn chi tiết thanh toán |
| — | *(không có ở SPEC cũ)* | 7 Modal (`削除確認` / `編集破棄`) | 🆕 SPEC cũ không định nghĩa modal riêng |

**Tổng kết delta:**

| | Số lượng |
|---|---|
| Screen cũ còn nguyên nghĩa | 5 |
| Screen cũ bị đổi code / gộp / tách | 5 |
| Screen cũ **không có** trong Figma | 3 |
| Screen **mới** hoàn toàn | 11 |

> **Khuyến nghị cho QC:** 3 screen code cũ không có trong Figma (`AW_AGCY_005`, `AW_AGCY_010`, `AW_AGCY_013`) → các TC gắn với chúng cần được BrSE xác nhận là **out of scope** hay **thiếu design**, trước khi bỏ hoặc giữ.

---

## Bước tiếp theo

Sau khi SPEC được BA/PM sign-off và các `Open Questions` 🔴 được giải quyết:

- "Hãy là Tech Lead Design, làm Design-Technical.md từ SPEC này: `es-kitchen-docs/docs/features/agency-referral-management/SPEC.md`" (cần DESIGN cho `es-kitchen-api` + `es-kitchen-web-admin`)
- "Hãy là QC, sinh test cases từ SPEC này: `es-kitchen-docs/docs/features/agency-referral-management/SPEC.md`"
- **Designer:** không cần chạy — 17 màn high-fi đã có sẵn trong Figma, URL đã điền ở cột `Figma Link` của `## Screens`.
