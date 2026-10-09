> **参考（個人アプリ側の仕様・2026/09/10）。** Web（運営・法人）の注文の正は `Đơn_hàng.md`。

# Spec chỉnh sửa: Hiển thị giá theo chi nhánh (拠点) trên app mobile

Ngày: 2026/09/10
Màn hình liên quan: **Giỏ hàng (Cart)**, **Xác nhận đơn hàng (màn confirm thanh toán)**

> Ghi chú: các đoạn text trong khung code là chuỗi hiển thị trên UI, giữ nguyên tiếng Nhật.

---

## 1. Nguyên tắc chung về giá

| Trường hợp | Giá hiển thị ở Giỏ hàng | Giá hiển thị ở màn Xác nhận đơn hàng | Popup cảnh báo |
|---|---|---|---|
| A. User đã set công ty trong profile **và** mã chi nhánh đang dùng thuộc đúng công ty đó | Giá do admin công ty đã set (giá chi nhánh) | Giá chi nhánh (giống Giỏ hàng) | Không |
| B. Guest mode / chưa set công ty | Giá bán bình thường (giá gốc) | Giá chi nhánh tương ứng với mã chi nhánh đã nhập/quét | **Có** (nếu giá có thay đổi) |
| C. Profile thuộc công ty X nhưng mua ở chi nhánh của công ty Y (khác) | Giá bán bình thường (giá gốc) | Giá chi nhánh của công ty Y | **Có** (nếu giá có thay đổi) |
| D. **ESQR** – quét mã QR của chi nhánh để mua hàng | Giá chi nhánh (đã xác định ngay từ lúc quét) | Giá chi nhánh (giống Giỏ hàng) | **Không** |

- Giá cuối cùng dùng để thanh toán **luôn là giá được set cho chi nhánh trong đơn hàng**, không phải giá hiển thị ở Giỏ hàng.
- Tổng tiền (合計) ở footer cũng phải tính lại theo giá chi nhánh ở màn Xác nhận đơn hàng.
  Ví dụ trong mockup: Giỏ hàng = 100円 × 4 → tổng 400円; Xác nhận = 50円 × 4 → tổng 200円.
- Nếu chi nhánh **chưa được set giá riêng** → fallback về giá bán bình thường. Lúc này giá không đổi giữa 2 màn nên **không hiển thị popup**.

### Về case D (ESQR)
ESQR là luồng quét mã QR của chi nhánh để mua hàng, nên chi nhánh đã được xác định ngay từ đầu và giá hiển thị từ đầu đã là giá của chi nhánh đó. Vì vậy **không cần popup cảnh báo và không có việc đổi giá giữa 2 màn** — luồng này bỏ qua toàn bộ mục 2 bên dưới.

---

## 2. Popup mới

**Nội dung hiển thị:**
```
ご利用の拠点に設定された販売価格が適用されます。
```

**Nút:**
- `戻る` (Quay lại) → đóng popup, ở lại màn Giỏ hàng (không chuyển màn).
- `確認` (Xác nhận) → chuyển sang màn Xác nhận đơn hàng với giá đã đổi theo chi nhánh.

**Điều kiện hiển thị:**
Chỉ hiển thị khi **giá trong đơn hàng thực sự có thay đổi** — tức là giá đang hiển thị ở Giỏ hàng ≠ giá chi nhánh sẽ áp dụng khi thanh toán.
→ Áp dụng cho case B và C.
→ **Không** hiển thị ở case A, case D (ESQR), và trường hợp chi nhánh chưa set giá riêng (giá không đổi).

**Tần suất:** hiển thị **mỗi lần thanh toán** (không có tùy chọn ẩn, không lưu trạng thái theo session).

**Thời điểm:** khi user bấm nút thanh toán (`支払い`) ở màn Giỏ hàng.

**Thứ tự popup** (theo mockup): bấm `支払い`
1. Popup hiện có `商品がお手元にあることを確認されましたか？` (có checkbox `しばらく表示しない`) → bấm `確認`
2. Popup mới `ご利用の拠点に設定された販売価格が適用されます。` → bấm `確認`
3. Chuyển sang màn Xác nhận đơn hàng

> Nếu user đã tick `しばらく表示しない` ở popup (1) thì popup (1) bị bỏ qua, popup (2) vẫn hiển thị bình thường.
> Popup (2) **không có** checkbox ẩn.

---

## 3. Hành vi khi quay lại Giỏ hàng từ màn Xác nhận đơn hàng

Khi user bấm nút back ở màn Xác nhận đơn hàng để quay về Giỏ hàng → **Giỏ hàng hiển thị lại giá gốc** (giữ nguyên quy tắc ở mục 1, không lưu giá chi nhánh).

Lý do:
- Quay lại = huỷ bước xác nhận, đơn hàng chưa được tạo nên không có gì được lưu.
- Giữ nhất quán với yêu cầu "popup hiển thị mỗi lần thanh toán": nếu Giỏ hàng đổi sang giá chi nhánh thì lần thanh toán sau sẽ không còn chênh lệch giá → popup không hiện, mâu thuẫn với quy tắc trên.
- Không phát sinh state tạm phải quản lý ở phía app.

Dòng ghi chú `※拠点によって販売価格が異なる場合があります。` ở mục 4 đã đóng vai trò giải thích cho user việc giá ở Giỏ hàng có thể khác giá thanh toán.

---

## 4. Text bổ sung ở màn Giỏ hàng (áp dụng cho MỌI trường hợp)

Thêm 1 dòng ghi chú vào khối chú thích nằm dưới ô mã chi nhánh / tên chi nhánh:

```
※登録拠点以外で利用する場合は、拠点IDを再読込してください。
※拠点IDをプロフィールで登録しておくと、毎回の購入時の登録が不要となります。
※拠点によって販売価格が異なる場合があります。   ← DÒNG MỚI
```

Style: giống 2 dòng hiện có (font nhỏ, màu xám, có tiền tố `※`).

---

## 5. Các quyết định đã chốt

| Nội dung | Quyết định |
|---|---|
| Quay lại Giỏ hàng sau khi xem màn Xác nhận | Hiển thị lại **giá gốc** (xem mục 3) |
| Tần suất hiển thị popup | **Mỗi lần thanh toán** |
| Chi nhánh chưa set giá riêng | Fallback về giá bán bình thường, **không hiển thị popup** (chỉ hiện khi giá trong đơn có thay đổi) |
| Giá chi nhánh **cao hơn** giá gốc | Xử lý giống nhau — chỉ hiển thị popup, không cần bước xác nhận thêm |

---

## 6. Checklist cho dev

- [ ] API lấy giá: bổ sung logic trả giá theo mã chi nhánh (giá công ty set) khi tạo/xác nhận đơn.
- [ ] Giỏ hàng: giữ giá gốc khi chưa xác định được công ty (guest / khác công ty).
- [ ] Giỏ hàng: hiển thị giá công ty khi profile công ty khớp với mã chi nhánh.
- [ ] Giỏ hàng: thêm dòng `※拠点によって販売価格が異なる場合があります。`
- [ ] Thêm popup mới + 2 nút `戻る` / `確認`.
- [ ] Điều kiện popup: so sánh giá Giỏ hàng vs giá chi nhánh, chỉ hiện khi **có chênh lệch**; hiện **mỗi lần** thanh toán.
- [ ] Luồng ESQR: giữ nguyên như hiện tại, không hiển thị popup, giá đã là giá chi nhánh từ đầu.
- [ ] Màn Xác nhận đơn hàng: hiển thị đơn giá + tổng tiền (合計金額) + tổng ở footer theo giá chi nhánh.
- [ ] Back từ màn Xác nhận về Giỏ hàng: hiển thị lại giá gốc, không cache giá chi nhánh.
- [ ] Đảm bảo giá thanh toán thực tế = giá chi nhánh (không dùng giá cache ở Giỏ hàng).
- [ ] Khi user đổi mã chi nhánh rồi quay lại Giỏ hàng → giá phải được load lại theo chi nhánh mới.
