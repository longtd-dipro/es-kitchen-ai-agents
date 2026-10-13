# 30 — Screen Index (bảng mô tả "đã vẽ gì" trên Figma)

> **BẮT BUỘC** sau khi vẽ xong Figma (Bước 5.5 của `designer-agent.md`, bước K7 của KIT). Áp dụng mọi platform.
> Mục đích: người mở file Figma biết ngay *đã vẽ những màn nào, ở node nào, loại gì, ứng với phần nào của REQ/prototype/SPEC* — không phải lần từng section.
> Format chuẩn lấy từ khối `④ BẢNG SCREEN INDEX` của file ALPHA-TEAM (node `86:1655`, file `C5XoY5yubkAMX3RzVY1N2u`).

---

## 1. Vị trí & đặt tên

| Thuộc tính | Quy tắc |
|---|---|
| Container | **1 FRAME** trên **cùng page** với các section vừa vẽ (vd `Admin Web (P2)`), không đặt trong section của màn hình |
| Tên layer | `Screen Index — <Feature> · <platform>` (vd `Screen Index — Hoá Đơn Admin · Admin Web E03`) |
| Vị trí | Phía **trên-trái** cụm section của feature, cách ≥ 200px; không chồng lên frame khác (quét bbox) |
| Khi vẽ bổ sung | Cập nhật **cùng frame đó** (thêm hàng, tăng `Tổng`), hàng mới tô highlight cam (§3.4) — KHÔNG tạo frame thứ hai |
| Tệp song song | Ghi bản markdown `screen-index.md` (cùng bảng + node ID) vào folder feature / `output/<feature>/` |

## 2. Cấu trúc nội dung (từ trên xuống)

1. **Tiêu đề** — `④ BẢNG SCREEN INDEX (<phạm vi>)` (số trước tiêu đề = số thứ tự khối nếu có nhiều bảng; 1 bảng thì dùng `BẢNG SCREEN INDEX (<phạm vi>)`).
2. **Dòng tổng** — `Tổng: <N> frame (<a> màn chính · <b> popup/trạng thái) · cột Ref = <nguồn tham chiếu> · <ghi chú phạm vi/những gì CHƯA vẽ>`.
3. **Header row** — `# · Screen · Ref · Loại · Mô tả`.
4. **Hàng dữ liệu** — 1 hàng / 1 frame đã vẽ, theo thứ tự trái→phải, trên→dưới trên canvas. Có ≥ 2 section/group → chèn **hàng nhóm** trước mỗi nhóm (§3.5).
5. **Dòng chân** — `Tổng: <N> … — chi tiết: <đường dẫn screen-index.md / SPEC.md>`.

### Cột

| Cột | Nội dung | Ví dụ |
|---|---|---|
| `#` | Số thứ tự liên tục (hàng nhóm không đánh số) | `7` |
| `Screen` | `<Screen Code> <Tên ngắn>` — **bold**; gắn **hyperlink NODE** tới frame (`setRangeHyperLink({type:'NODE', value: frameId})`) | `AW_BILL_003 Sửa hóa đơn` |
| `Ref` | Tham chiếu nguồn, màu primary, bold: `#` trạng thái prototype / FR / dòng REQ / mục SPEC | `#043–049` |
| `Loại` | Một trong: `List` · `Detail` · `Form` · `Wizard` · `Dashb.` · `Report` · `Settings` · `Chat` · `Modal` · `Popup` · `Toast` | `Form` |
| `Mô tả` | 1 dòng (≤ ~45 ký tự, tiếng Việt, có thể kèm JP) mô tả **nội dung đã vẽ**, ghi rõ trạng thái đại diện | `Sửa HĐ chưa phát hành, popup bỏ chỉnh sửa` |

## 3. Style (đo từ node `86:1655`)

### 3.1 Kích thước gốc (480 px) và hệ số `S`
Số đo gốc dùng khung rộng **480**. Trên canvas có frame 1440 thì chữ 7–9px không đọc được → **nhân hệ số `S = 2`** (rộng **960**, mọi font/khoảng cách ×2). Có thể đổi `S` nhưng phải nhân đồng bộ.

| Phần tử | Gốc (S=1) | Với S=2 |
|---|---|---|
| Rộng bảng | 480 | 960 |
| Tiêu đề | 13 Bold `#24292F` | 26 |
| Dòng tổng / chân | 9 Regular `#6E777D` | 18 |
| Header row | cao 26, nền `#E8F4FD`, viền 1 `#0969DA`, radius 4; chữ 7 Bold `#0969DA` | cao 52, viền 2, chữ 14 |
| Hàng dữ liệu | cao 23, chữ 7 | cao 46, chữ 14 |
| Cột x (từ trái) | `#` 6 · Screen 26 · Ref 182 · Loại 232 · Mô tả 284 | ×2 |
| Divider hàng | 1px `#D0D7DE` | 2 |

### 3.2 Font
Gốc dùng Inter. **Dự án này dùng `Noto Sans JP`** (có JP) — nếu chuỗi có tiếng Nhật thì bắt buộc Noto Sans JP; chuỗi thuần Latin có thể giữ Inter. Cả bảng dùng **một** family cho nhất quán → mặc định **Noto Sans JP**.

### 3.3 Màu chữ theo cột
`#` → `#6E777D` Bold · `Screen` → `#24292F` Bold · `Ref` → `#0969DA` Bold · `Loại` & `Mô tả` → `#424A53` Regular. Nền hàng xen kẽ **trắng `#FFFFFF` / `#F6F8FA`** (hàng lẻ trắng, hàng chẵn xám).

### 3.4 Hàng bổ sung (highlight cam)
Màn/popup thêm sau lần vẽ đầu (hoặc sau audit) → nền `#FFF8F0`, `#` và `Ref` đổi màu `#D86107` Bold. Ghi chú ở dòng Tổng: `#a–b bổ sung sau <lý do>`.

### 3.5 Hàng nhóm (mở rộng khi có nhiều section)
Cao bằng hàng dữ liệu, nền `#E8F4FD`, chữ `#0969DA` Bold: `▸ <Tên section> (<n> frame) — <node ID section>`. Không có số `#`.

### 3.6 Biến Figma
Ưu tiên bind variable (`text/high`, `text/low`, `text/middle`, `company/500`, `neutral/50`, `divider/middle`); hex trong bảng trên chỉ là giá trị đo. `#E8F4FD`/`#FFF8F0`/`#D86107` chưa có token → dùng hex.

## 4. Quy trình dựng (tóm tắt code)

```js
// 1. Thu thập frame: duyệt các section vừa vẽ, mỗi FRAME con có tên bắt đầu bằng Screen Code
//    (bỏ qua label TEXT). Lấy: id, name (CODE | vi | ja), loại, ref, mô tả.
// 2. Tạo frame container (auto-layout dọc, nền trắng, rộng 480*S), đặt vị trí an toàn.
// 3. Thêm title + subtitle → header row (rectangle+text hoặc auto-layout ngang) → từng hàng.
//    Mỗi hàng = auto-layout ngang cao 23*S, các ô FIXED width theo cột; nền xen kẽ.
// 4. Với ô Screen: textNode.setRangeHyperLink(0, len, {type:'NODE', value: frameId}).
// 5. Screenshot kiểm tra: không cắt chữ (textAutoResize=HEIGHT cho Mô tả), không chồng frame khác.
```

Dùng auto-layout (không rectangle + text rời như file mẫu) để thêm/xóa hàng dễ; **trực quan phải giống** file mẫu.

## 5. Definition of Done — Screen Index
- [ ] 1 hàng / 1 frame đã vẽ — không thiếu, không thừa; số `Tổng` khớp.
- [ ] Mỗi `Screen` có hyperlink NODE đúng; `Ref` đúng nguồn.
- [ ] Hàng nhóm đủ khi ≥ 2 section; hàng bổ sung có highlight cam.
- [ ] Dòng Tổng nêu rõ **phạm vi chưa vẽ** (trạng thái lỗi / 0 dòng / quyền…).
- [ ] Style đúng §3 (header xanh nhạt + viền, hàng xen kẽ, màu cột); font nhất quán, không bị cắt chữ.
- [ ] Frame nằm cùng page, không chồng frame khác; bản `screen-index.md` đã ghi.
