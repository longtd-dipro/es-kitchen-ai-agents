# Business Flows — Long-term Project Memory

> **Nguồn truth:** `es-kitchen-requirements/function_list.xlsx` (BA cập nhật trên xlsx, sau đó re-extract sang markdown qua `es-kitchen-requirements/_extract_xlsx.py`).
>
> **Mục đích:** Long-term memory cho cả dự án ESKITCHEN — `ba-agent`, `techlead-design-agent`, `pm-agent` đọc on-demand khi cần hiểu nghiệp vụ trước khi viết SPEC / DESIGN / PLAN.
>
> **Đã bỏ qua khi extract:** sheets `backup_function_2`, `Copy of phase 2_brse`, `phase 2_brse`, `backup_Function List` (4 sheets backup / phase-2 brSE riêng).

---

## Khi nào load file nào

**Đọc on-demand, không load tất cả cùng lúc** — tuân thủ "không đọc rộng ngoài role" của POLICIES.md.

| Tình huống | File cần đọc |
|---|---|
| BA tạo SPEC mới, chưa biết feature thuộc domain nào | `business-flow-index.md` để lookup → chọn 1 domain |
| BA đã biết domain (ví dụ Hợp đồng) | `domains/<slug>.md` tương ứng |
| Tech Lead Design cần hiểu actors/flow trước khi vẽ data model | `domains/<slug>.md` |
| PM cần ước lượng scope theo epic | `function-list.md` (summary by epic) |
| Dev / QC cần đặt screen code mới | `screen-code-rule.md` |
| Lookup tổng quan toàn bộ 23 nghiệp vụ + Backlog ID | `business-flow-index.md` |

---

## Root files (4)

| File | Nguồn xlsx sheet | Size | Nội dung |
|---|---|---|---|
| [`business-flow-index.md`](./business-flow-index.md) | `Business Flow` | ~7 KB | Master index 23 nghiệp vụ — Target/Nội dung/Backlog ID/FigJam link |
| [`function-list.md`](./function-list.md) | `Function List` | ~135 KB | Summary by epic + Phase 1 (54 rows) + Phase 2 (289 rows) — chi tiết STORY + DESCRIPTION + status |
| [`screen-code-rule.md`](./screen-code-rule.md) | `Screen Code Rule` | ~2 KB | Quy tắc `<Module>_<Feature>_<Seq>` |
| [`overview.md`](./overview.md) | `Overview` | <1 KB | (sparse — sheet gốc trống) |

---

## Domain files (15)

Mỗi file là 1 nghiệp vụ trong `domains/` — header table: `PHASE · ID · EPIC · STORY · STORY_2 · STORY_3 · DESCRIPTION · PRIORITY · BUSINESS FLOW`.

### Vận hành Cốt lõi

| Domain | File | Target (actors) | Backlog | Liên quan repos |
|---|---|---|---|---|
| Hợp đồng — Quản lý Hợp đồng | [`domains/hop-dong.md`](./domains/hop-dong.md) | System Admin, Company Admin, Outsource Admin | ESKITCHEN-1235 | `es-kitchen-api` · E02 · E03 · E05 |
| Menu & Order — Quản lý Thực đơn & Đặt hàng | [`domains/menu-order.md`](./domains/menu-order.md) | System Admin, Company Admin, User Mobile | ESKITCHEN-1239 | `es-kitchen-api` · E01 · E02 · E03 |
| Giao hàng — Lịch trình & Điều phối | [`domains/giao-hang-dieu-phoi.md`](./domains/giao-hang-dieu-phoi.md) | System Admin, Company Admin | ESKITCHEN-1236 | `es-kitchen-api` · E02 · E03 |
| Đặt hàng NCC | [`domains/dat-hang-ncc.md`](./domains/dat-hang-ncc.md) | System Admin, Supplier | ESKITCHEN-1240 | `es-kitchen-api` · E03 · E04 |
| Giao hàng — Web Đối tác Vận chuyển | [`domains/giao-hang-doi-tac.md`](./domains/giao-hang-doi-tac.md) | Outsource Admin | ESKITCHEN-1237 | `es-kitchen-api` · E05 |
| Giao hàng — App Tài xế | [`domains/giao-hang-tai-xe.md`](./domains/giao-hang-tai-xe.md) | Driver | ESKITCHEN-1238 | `es-kitchen-api` · E06 (`es-kitchen-webapp-driver`) |
| Thanh toán & Hoàn tiền | [`domains/thanh-toan.md`](./domains/thanh-toan.md) | User Mobile, Company Admin, System Admin | ESKITCHEN-1241 | `es-kitchen-api` · E01 · E02 · E03 (elepay) |
| Thu tiền & Hàng hủy | [`domains/thu-tien-huy.md`](./domains/thu-tien-huy.md) | Driver, Outsource Admin, System Admin | ESKITCHEN-1242 | `es-kitchen-api` · E03 · E05 · E06 |

### Quản lý Tài sản & CSKH

| Domain | File | Target (actors) | Backlog | Liên quan repos |
|---|---|---|---|---|
| Tồn kho & Thiết bị | [`domains/ton-kho-thiet-bi.md`](./domains/ton-kho-thiet-bi.md) | System Admin, Company Admin | ESKITCHEN-1243 | `es-kitchen-api` · E02 · E03 |
| User Binding — Liên kết Nhân viên & Phúc lợi | [`domains/user-binding.md`](./domains/user-binding.md) | User Mobile, Company Admin | ESKITCHEN-1244 | `es-kitchen-api` · E01 · E02 |
| User Engagement — Tương tác & Khảo sát | [`domains/user-engagement.md`](./domains/user-engagement.md) | User Mobile, System Admin | ESKITCHEN-1245 | `es-kitchen-api` · E01 · E03 |
| Marketing — Giới thiệu Công ty (Referral) | [`domains/marketing.md`](./domains/marketing.md) | System Admin, Company Admin, User Mobile | ESKITCHEN-1246 | `es-kitchen-api` · E01 · E02 · E03 |
| Đại lý — Quản lý Đại lý (Agency) | [`domains/dai-ly.md`](./domains/dai-ly.md) | System Admin | ESKITCHEN-1247 | `es-kitchen-api` · E03 |

### Nền tảng & Quản trị

| Domain | File | Target (actors) | Backlog | Liên quan repos |
|---|---|---|---|---|
| System & Other — Cấu hình & Tích hợp | [`domains/system-other.md`](./domains/system-other.md) | System Admin | ESKITCHEN-1249 | `es-kitchen-api` · E03 (Hubspot, Thomas, Yamato/Sagawa) |

---

## Lookup nhanh — Repo → Domain

| Repo | Domain(s) liên quan |
|---|---|
| `es-kitchen-payment-app` (E01) | menu-order · thanh-toan · user-binding · user-engagement · marketing |
| `es-kitchen-web-company` (E02) | hop-dong · menu-order · giao-hang-dieu-phoi · thanh-toan · ton-kho-thiet-bi · user-binding · marketing |
| `es-kitchen-web-admin` (E03) | hop-dong · menu-order · giao-hang-dieu-phoi · dat-hang-ncc · thanh-toan · thu-tien-huy · ton-kho-thiet-bi · user-engagement · marketing · dai-ly · system-other |
| `es-kitchen-web-supplier` (E04) | dat-hang-ncc |
| `es-kitchen-web-outsource-web-private` (E05) | hop-dong · giao-hang-doi-tac · thu-tien-huy |
| `es-kitchen-webapp-driver` (E06) | giao-hang-tai-xe · thu-tien-huy |

---

## Re-sync khi xlsx đổi

Khi BA cập nhật `function_list.xlsx`:

```bash
python3 es-kitchen-requirements/_extract_xlsx.py
```

Script overwrites all markdown files trong folder này. Diff git để xem thay đổi → commit cùng với xlsx.

**Không sửa markdown trực tiếp** — markdown là derived artifact, xlsx là source of truth.
