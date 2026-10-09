> **参考（AI チーム向けの引き渡し資料・2026/07/31、2026/09/30 追記）。注文の正は `docs/01_仕様/50_注文/注文.md`。** 次の点はその後の決定で変わっている（AI チームへ伝える）：§4.4「Max mỗi sản phẩm（1商品あたりの上限）」→ **持たない**／§4.2 短消費期限の既定「取らない」→ **取る**／§4.3 便の数え方 → **温度帯ごと**／§7.3「1拠点に複数台」→ **1契約＝1台**／§5 AI mode → 入口は3つ（均等配分・過去データを参照・チャット）＋「次回以降も適用」。

# ORDER SPEC – Bàn giao cho Team AI

**Phạm vi:** Menu, Food Master và luồng Order — phục vụ team AI xây dựng tính năng **gợi ý món ăn** và **tự sinh số lượng order**.
**Nguồn:** Biên bản họp review Phase 2 (Menu & Order).
**Cập nhật:** 31/07/2026
**Cập nhật bổ sung:** 2026/09/30 — phản ánh trả lời 要件シート Phase2 (hàng 32・76・129・130・170・173) 〔決定_要件シート一部反映_回答_20260930〕

**Cách đọc tài liệu:**

- Mục 1–3: bối cảnh + dữ liệu đầu vào AI được dùng.
- Mục 4: cách order hoạt động và **ràng buộc bắt buộc** khi AI sinh số lượng.
- Mục 5–7: AI mode, gợi ý món, và trường hợp máy bán hàng tự động.
- Mục 8: **các câu hỏi cần team AI xác nhận** (gồm cả thắc mắc trên file `ES_KITCHEN_AI`).
- Điểm chưa chốt được đánh dấu **[Cần xác nhận]**.

---

## 0. Thuật ngữ nhanh

| Thuật ngữ | Ý nghĩa |
|---|---|
| **System Admin** | Bên tạo menu hàng tháng và set số lượng tiêu chuẩn. |
| **Company / Chi nhánh** | Khách hàng đặt hàng. 1 company có nhiều chi nhánh; mỗi chi nhánh đặt đơn riêng. |
| **ES** | Nội bộ vận hành; có thể order thay khi company không tự order. |
| **Plan** | Gói của chi nhánh, quy định **tổng số lượng tối đa** được đặt (VD Plan 100 = tối đa 100 cái). |
| **Course** | Phân loại nhiệt độ của món: **Light** (thường/mát) hoặc **Standard** (đông lạnh). |
| **Ship (lần giao)** | Một tháng chia thành nhiều lần giao; order thực hiện **trên từng lần ship**. |
| **Cái (đơn vị)** | Đơn vị tính số lượng là **số cái của một sản phẩm**, KHÔNG phải số món. |

---

## 1. Bối cảnh & vai trò của AI

Đây là hệ thống B2B suất ăn: **System Admin** tạo menu mỗi tháng → **Company / chi nhánh** đặt hàng dựa trên menu đó.

- Mỗi tháng chỉ có **một menu duy nhất** (Phase 2 đã bỏ khái niệm "Menu Type").
- Menu ví dụ có khoảng **30 sản phẩm**.

**AI làm gì:** gợi ý món và **tự sinh số lượng order** cho company, dựa trên (a) thuộc tính food, (b) cấu hình của company, (d) **dữ liệu thực tế: lịch sử order của company, tỷ lệ hủy bỏ (廃棄率) và tồn kho** (2026/09/30 bổ sung 〔要件シート 行76・決定_要件シート一部反映_回答_20260930〕), và phải tuân đúng (c) các ràng buộc số lượng theo Plan / hợp đồng.

---

## 2. Dữ liệu đầu vào — Food Master

Mỗi **food** mang các thuộc tính sau; đây là **dữ liệu AI dùng để gợi ý món**:

| Thuộc tính | Ý nghĩa / dùng cho gì |
|---|---|
| **Category** | Nhóm món. Company có thể bật/tắt theo category (mục 4.2). |
| **Course** | Light / Standard (mục 2.1). |
| **Food tag** | Nhãn phân loại món. |
| **HSD ngắn** | Hạn sử dụng ngắn (VD salad ~2–3 ngày). |
| **Giá bán** | Giá bán cho user (chưa gồm giảm giá / phúc lợi). |
| **Column** | *Chỉ với máy bán hàng tự động* — loại cột chứa món (mục 7). |
| **Kho picking** | Kho lấy hàng (mục 2.2). |

> ⚠️ **Lưu ý cốt lõi:** cả **Course** và **Kho picking** được quy định ở **cả Food Master lẫn hợp đồng của company**. Vì vậy **tập food (và cả cách hiển thị) sẽ khác nhau tùy theo hợp đồng**. → AI phải lấy food **theo đúng hợp đồng** của company/chi nhánh đang đặt, không dùng danh sách food chung.

### 2.0. Dữ liệu đầu vào cho gợi ý số lượng order (2026/09/30 đã chốt)

AI gợi ý **số lượng order** dựa trên **lịch sử order thực tế của company (chi nhánh)**, **tỷ lệ hủy bỏ (廃棄率)** và **tồn kho**. Đây là dữ liệu đầu vào cần truyền cho team AI 〔要件シート 行76・決定_要件シート一部反映_回答_20260930〕.

- Lịch sử order thực tế của company / chi nhánh
- Tỷ lệ hủy bỏ (廃棄率)
- Tồn kho

### 2.1. Course (Light / Standard)

*(Xác nhận theo màn hình Plan Master — xem Phụ lục C.)*

- **Light (ESライト)** = **冷蔵・常温** (mát + thường).
- **Standard (ESスタンダード)** = **冷凍・冷蔵・常温** (đông lạnh + mát + thường).
- **Standard bao gồm cả Light** (Standard = đông lạnh + toàn bộ Light) → đơn Standard thường **nhiều món hơn** và tổng số lượng Standard **luôn ≥** Light.
- Course được chọn **khi ký hợp đồng** (cùng với Plan, phương thức ship, kho picking) và cũng được gán ở food → **tùy hợp đồng, tập food khác nhau**.
- Trên Product Master, course là **multiselect** (có thể chỉ chọn Standard).

### 2.2. Kho picking

- Quy định ở **cả Food Master lẫn hợp đồng của company**.
- **Hợp đồng quyết định** food đó **có hiển thị / dùng kho picking này hay không**.
- Trên Product Master là **multiselect** (VD Hà Nội / Sài Gòn hoặc cả hai).

---

## 3. Menu

- Mỗi tháng **1 menu**, gắn danh sách sản phẩm (mỗi sản phẩm mang đủ thuộc tính ở mục 2).
- **Số lượng tiêu chuẩn (基準注文数)** do System Admin set là **giá trị mặc định** khi company không tự đặt. Trên màn hình tạo menu có **3 cột số lượng tiêu chuẩn** riêng biệt (xem Phụ lục B):
  - `基準注文数` — số lượng tiêu chuẩn thường.
  - `短消費期限なし基準注文数` — số lượng tiêu chuẩn **cho hàng KHÔNG có HSD ngắn**.
  - `自販機基準注文数` — số lượng tiêu chuẩn **cho máy bán hàng tự động**.
- Điều kiện công khai menu: **tất cả sản phẩm publishable + đã upload Menu PDF** thì menu mới được công khai.

---

## 4. Order — cách hoạt động

### 4.1. Cấu trúc order

- **1 chi nhánh = 1 order.** Company tổng có thể đặt hộ cho nhiều chi nhánh (giao diện chia theo tab từng chi nhánh).
- Mỗi order gắn với **Plan** của chi nhánh (VD Plan 100) và **course** (Light/Standard).
- **Trạng thái order là 1 trạng thái duy nhất + lịch sử thay đổi (khi nào, ai thay đổi).** Không tách thành 2 trục (trạng thái phía khách / trạng thái phía ES). Đây là kết quả rà soát để trả lời khách (2026/09/30 〔要件シート 行130・決定_要件シート一部反映_回答_20260930〕).

### 4.2. Cấu hình của Company (input cho AI)

Company tự set cấu hình; AI dùng làm đầu vào để suy đoán:

- **Category on/off** (toggle) — VD tắt "thịt gà", hoặc tắt cả một category.
- **Có / không lấy hàng HSD ngắn** — mặc định thường **không** lấy.
- Đây là **preset** thay cho mặc định của System Admin (dùng khi company không muốn tự đặt từng món).
- **[Cần xác nhận]** Giới hạn theo **số lượng**: có (liên quan phúc lợi nhân viên). Giới hạn theo **tổng tiền**: sơ bộ **không**.

### 4.3. Cách tính số lượng

**Nguyên tắc:** order nằm trong phạm vi **Plan** và được **chia đều theo từng lần ship**.

1. **Phạm vi Plan:** tổng số lượng đặt ≤ số lượng tối đa của Plan.
   *VD: menu 30 sản phẩm, Plan 50 → chọn tổng 50 (VD 25 món × 2 cái).*
2. **Order theo từng lần ship (KHÔNG phải 1 lần/tháng):**
   - **Số lần ship do hợp đồng quy định.** Đơn được đặt trên **từng lần ship**.
   - **Số lượng mỗi lần ship = Plan ÷ số lần ship.**
   - Chênh lệch giữa các lần ship **≤ ±1** (phân bổ đều nhất có thể).
   - Tổng tất cả các lần ship = số lượng tối đa của Plan.
   - Plan > 100 → thường 2 hoặc 4 lần; tùy option lên tới **8 lần ship**.
   - **Hàng đông lạnh** giao chia nhiều lần cũng **phân bổ đều** giữa các lần ship (2026/09/30 bổ sung 〔要件シート 行173・決定_要件シート一部反映_回答_20260930〕).
3. **Nếu company không tự đặt** → tự động điền **số lượng tiêu chuẩn** của System Admin.

**Ví dụ chia đều:**

| Plan | Số lần ship | Kết quả mỗi lần |
|---|---|---|
| 100 | 2 | 50 – 50 |
| 250 | 4 | 62 – 62 – 63 – 63 ✅ (KHÔNG được 61 – 64 ❌) |

> Đơn vị luôn là **số cái của một sản phẩm**, không phải số món.

### 4.4. Ràng buộc bắt buộc (AI phải tuân khi sinh & khi Lưu)

| Ràng buộc | Mô tả |
|---|---|
| **Max tổng** | Tổng order ≤ số lượng Plan. |
| **Max mỗi lần ship** | = Plan ÷ số lần ship (chênh lệch ≤ ±1). |
| **Max theo nhóm nhiệt độ** | Riêng cho **đông lạnh** và **thường/mát**. |
| **Max mỗi sản phẩm** | VD tối đa 5 cái/sản phẩm. Sản phẩm cùng nhóm đông lạnh **gộp chung**. |

**Giới hạn theo hợp đồng (Plan Master):**

- Số lượng **hàng đông lạnh**: quyết định bằng **số cái** theo Plan — `冷凍の月次提供数` (số cung cấp đông lạnh/tháng) trong Plan Master. **Không** có giới hạn trên / dưới theo **tỷ lệ %** (VD trên 30%, dưới 10%) (2026/09/30 thay đổi. Cũ: Số lượng tối đa **hàng đông lạnh**. 〔要件シート 行170・決定_要件シート一部反映_回答_20260930〕).
- Số lượng tối đa **hàng nhiệt độ thường / mát**.
- ✅ **Đã chốt:** tổng của 2 nhóm (đông lạnh + thường/mát) **có thể ≠ tổng chung**; giá trị do **System Admin set**.
  *VD Plan Standard: thường max 200, đông lạnh max 200, nhưng tổng chung có thể vẫn là 200.*

### 4.5. Cảnh báo (KHÔNG chặn order) — 2026/09/30 bổ sung

Khác với ràng buộc ở 4.4, các điều kiện dưới đây chỉ **hiện cảnh báo**, **vẫn cho Lưu / đặt order**.

| Cảnh báo | Điều kiện | Ghi chú |
|---|---|---|
| **Vượt sức chứa cột Belt** | Số order của **các sản phẩm tương thích Belt** > **tổng sức chứa các cột Belt** của máy (tính từ Machine Master) | Công thức tính số chứa tối đa sẽ chốt riêng (マスタ項目一覧 §0.9 OPEN #10) 〔要件シート 行32・決定_要件シート一部反映_回答_20260930〕 |
| **Vượt sức chứa tủ đông** | Số order **đông lạnh của 1 lần ship** > **số chứa tối đa của tủ đông** (最大収納数 trong Machine Master) | Bảng tủ đông đang chờ khách gửi 〔要件シート 行173・決定_要件シート一部反映_回答_20260930〕 |

### 4.6. Ô nhập số lượng order — 2026/09/30 bổ sung

- Khi click vào ô số lượng order → **chọn toàn bộ số** trong ô, có thể **gõ đè ngay**. Áp dụng cho **cả 運営Web và 法人Web** 〔要件シート 行129・決定_要件シート一部反映_回答_20260930〕.

---

## 5. AI Mode & luồng Preview / Apply

- AI hiện có **2 mode**. *(Thiết kế gốc từ Đức có thêm mode "chia đều" khi menu > 100 — phần này **do BE thực hiện, không cần confirm**.)*
- **Preview:** sau khi AI generate → cho **xem trước 1 lần / mỗi menu**, kèm checkbox **"Apply cho những lần tiếp theo"**.
- Setting được check trên **menu hiện tại**; mỗi menu chạy 1 lần rồi mới apply (kèm thông báo).
- **Apply = coi như đã Lưu 1 lần** (sau đó chỉ cần edit nếu muốn).
- Sau khi AI sinh → **tự động điền số lượng** vào menu; toàn bộ vẫn phải thỏa ràng buộc ở **mục 4.4**.

---

## 6. Gợi ý món ăn (Suggest)

- AI dùng các thuộc tính food ở **mục 2** (category, course, food tag, HSD ngắn, giá bán, column) làm **dữ liệu tham khảo** để gợi ý.
- Khi gợi ý **số lượng**, AI dùng **lịch sử order thực tế của company, tỷ lệ hủy bỏ (廃棄率) và tồn kho** (mục 2.0) (2026/09/30 bổ sung 〔要件シート 行76・決定_要件シート一部反映_回答_20260930〕).
- Kết hợp **cấu hình company** (mục 4.2) để lọc / ưu tiên (VD bỏ HSD ngắn, tắt category, ưu tiên theo course).
- Mọi gợi ý phải **nằm trong Plan** và **tuân ràng buộc số lượng** (mục 4.3, 4.4).

---

## 7. Máy bán hàng tự động (ảnh hưởng tới AI)

### 7.1. Cấu tạo & thuật ngữ layout

Máy bán hàng tự động được chia thành lưới **段 (row/tầng)** × **column (cột/lane)**. Mỗi **column** là một khe chứa **một loại sản phẩm** theo chiều dọc; số sau tên column là **sức chứa (capacity)** — số sản phẩm nạp được trong cột đó.

![Ảnh máy bán hàng tự động thực tế](images/vending-machine-photo.png)

| Thuật ngữ (JP) | Tên | Giải thích |
|---|---|---|
| **シングル** | **Single** | Cột **đơn** — rộng **1 lane**, cơ cấu xoắn ốc 1 vòng. |
| **ダブル** | **Double** | Cột **đôi** — rộng **2 lane** (chiếm 2 cột lưới), xoắn ốc 2 vòng, cho món to. |
| **ベルト** | **Belt** | Cột dùng **băng tải** — cho món mềm/dễ vỡ. |
| **無効** | **Disabled** | Vị trí **không dùng / không gán** sản phẩm. |
| số (8, 10, 5…) | **Capacity** | **Sức chứa** = số sản phẩm cột đó chứa được. VD `ダブル10` = cột đôi chứa 10 cái. |

### 7.2. Ví dụ layout (từ Machine Master)

![Sơ đồ layout máy bán hàng tự động](images/vending-machine-layout.png)

Lưới 6 tầng (A–F) × 10 cột. Đọc sơ đồ:

| Tầng | Bố trí | Sức chứa tầng |
|---|---|---|
| A | `ダブル10` × 5 (mỗi cái chiếm 2 cột) | 5 × 10 = **50** |
| B | `ダブル8` × 5 | 5 × 8 = **40** |
| C | `シングル8` × 8 (cột 1–8) + `無効` × 2 (cột 9–10) | 8 × 8 = **64** |
| D | `シングル8` × 8 + `無効` × 2 | 8 × 8 = **64** |
| E | `シングル8` × 8 + `無効` × 2 | 8 × 8 = **64** |
| F | `ベルト5` × 8 (cột 1–8) + `ダブル8` × 1 (cột 9–10) | 8 × 5 + 8 = **48** |

→ **Tổng sức chứa máy** = 50 + 40 + 64 + 64 + 64 + 48 = **330 cái** (tính được từ Machine Master).

> **Lưu ý:** layout mỗi máy **có thể được khách custom** (VD Double ở trên, Single ở dưới, Belt ở đáy…) → hệ thống **không set cứng** được từng vị trí, chỉ dựa theo Machine Master để hiển thị/tính tương đối.

### 7.3. Ảnh hưởng tới AI

- Order chia theo **loại column: Single / Double / Belt** (loại `無効` vẫn hiển thị để biết).
- Sức chứa mỗi loại tính từ **Machine Master** (VD `ダブル8` × 5 cột = 40 cái).
- **1 máy = 1 hợp đồng** → tách thành nhiều chi nhánh; lý tưởng đặt theo từng máy.
- **1 chi nhánh có > 1 máy** → phải **phân order theo column của từng máy** (chia ở cấp từng máy).
- Sức chứa tối đa của máy chỉ mang tính **tham khảo**; ưu tiên các số theo Plan. Riêng **cột Belt**: nếu số order của sản phẩm tương thích Belt vượt tổng sức chứa các cột Belt → **hiện cảnh báo, không chặn** (mục 4.5) (2026/09/30 bổ sung 〔要件シート 行32・決定_要件シート一部反映_回答_20260930〕).
- Phần máy bán hàng tự động **không phân trang** (khác phần thường).

---

## 8. Điểm cần Team AI xác nhận

**A. Về AI mode & giao diện**

1. **2 AI mode** — **Suggest từ quá khứ** và **Chat để suggest** — trên màn hình có **tách thành 2 luồng vào (entry) riêng** không, hay đi chung một luồng?

**B. Về logic sinh order**

2. Khi vừa vướng ràng buộc **Plan tổng** vừa vướng **max theo nhóm nhiệt độ** + **max/sản phẩm** — **thứ tự ưu tiên áp dụng** là gì?
3. Với máy bán hàng tự động: AI có cần **tối ưu theo layout cột** (Double/Single/Bell) hay chỉ theo **số lượng tổng**?

**C. Về dữ liệu suggest**

4. Input suggest chỉ dùng **thuộc tính food**, hay dùng thêm **lịch sử order / review sản phẩm / dấu hoa thị (tần suất vào menu)**?
   → **2026/09/30 đã chốt (phần số lượng):** gợi ý số lượng order dùng **lịch sử order thực tế của company, tỷ lệ hủy bỏ (廃棄率) và tồn kho** (mục 2.0) 〔要件シート 行76・決定_要件シート一部反映_回答_20260930〕. Có dùng **review sản phẩm / dấu hoa thị** hay không vẫn **[Cần xác nhận]**.
5. **Lịch sử & món tương tự:** menu mỗi tháng đều thay đổi; 1 món có thể quay lại 2–3 lần/năm (cách nhau vài tháng). Có cách nào **suggest từ món tương tự trong quá khứ** (VD dựa trên **nguyên liệu món ăn**) không?

**D. Thắc mắc trên file `ES_KITCHEN_AI`**

6. Spec ghi: *"AI chỉ sử dụng dữ liệu lịch sử có trước tháng cần đề xuất. Dữ liệu phát sinh trong tháng mục tiêu không được dùng để dự đoán cho chính tháng đó."*
   → Vậy khi **chat request update order**, đề xuất mới có được **dựa trên kết quả order trước đó** (trong cùng tháng) không?
7. Spec ghi: *"Tổng số lượng phải đáp ứng kế hoạch mỗi ngày."*
   → Thực tế order **theo tháng, không có kế hoạch theo ngày**. → **"Bước 2: Tối ưu món và số lượng"** cần chỉnh lại cho đúng business.
8. Spec hỏi: *"Trong các món AI đề xuất, công ty giữ lại bao nhiêu món trong đơn thực tế?"*
   → Nghĩa là sau mỗi lần prompt, company **approve từng món** (không approve cả bảng)? Cần xác nhận cơ chế approve.

---

## Phụ lục — Field thực tế trên UI (tham khảo)

> Trích từ ảnh chụp màn hình thực tế của hệ thống ES STATION. Giữ nguyên tên field tiếng Nhật để đối chiếu; phần trong ngoặc là diễn giải.

### Phụ lục A — Product Master (商品マスタ登録)

![Màn hình Product Master (trái: tab 管理用 · phải: tab 表示用)](images/screen-product-master.png)

Màn hình có 3 tab: **管理用** (quản lý) · **表示用** (hiển thị cho user) · **変更履歴** (lịch sử thay đổi).

**基本情報 (Thông tin cơ bản):**

| Field | Diễn giải |
|---|---|
| 品番 | Mã sản phẩm |
| JANコード * | Mã JAN (bắt buộc) |
| 商品名 * | Tên sản phẩm |
| 商品名カナ * | Tên sản phẩm (katakana) |
| カテゴリ * | Category (dropdown) |
| 販売価格 * | Giá bán (円) |
| 商品備考 | Ghi chú sản phẩm |
| 商品写真 | Ảnh sản phẩm |

**Tab 管理用 → 栄養成分（100g当たり）(Dinh dưỡng/100g):** 1食当たり内容量 (khối lượng/suất, g), エネルギー* (kcal), たんぱく質* (đạm), 脂質* (béo), 炭水化物* (carb), 食塩相当量* (muối), その他成分 (thành phần khác).

**Tab 管理用 → 保管情報 (Thông tin bảo quản):**

| Field | Diễn giải |
|---|---|
| ピッキング倉庫 | **Kho picking** (dropdown) |
| 保管方法(管理用) | Cách bảo quản (quản lý) |
| 保管方法(表示用) | Cách bảo quản (hiển thị) |
| コース | **Course** (dropdown) |

**Tab 管理用 → 自販機 (Máy bán hàng tự động):** 自販機コラム (**column** — multiselect, VD シングル8 / シングル10), 対応機種 (máy tương thích — VD 富士電機, サンデン), 自販機コラム備考; và 出荷指示の同梱資材 (vật tư đóng kèm khi ship), 出荷時の特殊指示 (chỉ dẫn ship đặc biệt).

**Tab 管理用 → 消費期限 (Hạn sử dụng):** ESの消費期限 (số + dropdown đơn vị), メーカーの消費期限. **短消費期限 (HSD ngắn — radio):** `対象外` (không áp dụng) / `ショート：1週間以内` (≤ 1 tuần) / `セミショート：1週間〜1ヶ月程度` (1 tuần – 1 tháng).

**Tab 管理用 → 仕入先 (Nhà cung cấp):** bảng gồm 選択中, 仕入先名, 仕入単価 (giá nhập), ロット (lot), 仕入れ備考, 操作.

**Tab 表示用 (hiển thị cho user):** 商品解説 (mô tả); 栄養成分表示 (dinh dưỡng có ô 推定値 = giá trị ước tính); アレルゲン・原料情報 (特定原材料 / 特定原材料に準ずるもの); 成分表示 (原材料名 / 添加物); 内容量; 製造元 (ホームページ).

### Phụ lục B — Màn hình tạo Menu (月間メニュー登録)

![Màn hình tạo Menu + cột số lượng tiêu chuẩn + modal 商品追加](images/screen-menu-create.png)

**Header 月間メニュー:** 年月* (năm-tháng), 法人向け公開ステータス (trạng thái công khai cho company), 自動公開日付 (ngày tự động công khai), メニューPDF. → *Menu chỉ công khai khi tất cả sản phẩm publishable + đã upload PDF.*

**Bộ lọc 商品一覧:** 商品名 · 全てカテゴリ · 自販機コラム · 営業サンプル (sample kinh doanh). *(Đang lọc thì không sắp xếp được.)*

**Cột bảng sản phẩm trong menu:**

| Cột | Diễn giải |
|---|---|
| 公開可能 | Có thể công khai (checkbox) |
| カテゴリ / コース | Category / Course (ライト / スタンダード) |
| 営業サンプル | Sample kinh doanh (checkbox) |
| ピッキング倉庫 / 仕入先 | Kho picking / Nhà cung cấp |
| 商品タグ | **Food tag** (dropdown): NEW, 定番, 再登場, 冷たくても美味しい |
| 短消費期限 | HSD ngắn (ショート / セミショート …) |
| 販売価格 / 仕入価格 | Giá bán / Giá nhập |
| **基準注文数** | Số lượng tiêu chuẩn (thường) — có nút − / + |
| **短消費期限なし基準注文数** | Số lượng tiêu chuẩn cho hàng KHÔNG HSD ngắn |
| **自販機基準注文数** | Số lượng tiêu chuẩn cho máy bán hàng tự động |
| 自販機コラム | Column máy bán hàng (シングル8/10, ダブル8/10, ベルト) |

**Modal 商品追加 (Thêm sản phẩm):** lọc theo 商品名 / 前回メニュー (menu lần trước) / カテゴリー / コース. Cột đáng chú ý cho AI:

- **継続** — cột đánh dấu **米 (＊)** = ứng với **dấu hoa thị** (món có/không xuất hiện liên tiếp).
- **前回メニュー** — **tháng gần nhất món vào menu** (VD 2026年1月, 2026年3月…) → dữ liệu lịch sử để suggest.

### Phụ lục C — Plan Master (プランマスタ情報登録)

![Màn hình Plan Master (trái: tab ESスタンダード · phải: tab ESライト)](images/screen-plan-master.png)

**プラン設定 (Cấu hình Plan):**

| Field | Diễn giải |
|---|---|
| プランID | Mã Plan |
| 公開用プラン名 * / 管理用プラン名 * | Tên Plan (công khai / quản lý) |
| 公開ステータス * | Trạng thái công khai (非公開 → ẩn khỏi màn hình khách) |
| **月次提供上限の合計** * | **Tổng số lượng cung cấp tối đa/tháng** (= Plan tổng) |
| **基本比×倍** * | Hệ số nhân — *tính theo bội số của gốc 50 cái* |
| コース | 全て / ESスタンダード（冷凍・冷蔵・常温）のみ / ESライト（冷蔵・常温）のみ |

**Tab ESスタンダード（冷凍・冷蔵・常温）:** 冷凍_月次提供数_上限* / 下限* (giới hạn trên/dưới **hàng đông lạnh**), 冷蔵・常温_月次提供数_上限* / 下限* (giới hạn trên/dưới **mát + thường**). → *Xác nhận: 2 nhóm nhiệt độ có giới hạn upper/lower riêng.*
> 2026/09/30: số lượng đông lạnh được chỉ định bằng **số cái** (冷凍の月次提供数); **không** dùng giới hạn theo tỷ lệ % (trên 30% / dưới 10%) 〔要件シート 行170・決定_要件シート一部反映_回答_20260930〕. (Ảnh trên là màn hình hiện tại, tham khảo.)

**Tab ESライトプラン（冷蔵・常温）:** chỉ có 冷蔵・常温_月次提供数_上限* / 下限* (Light không có nhóm đông lạnh).

**Bảng giá (cả 2 tab):** 公開用, 価格プラン*, 開始期間*, 終了期間, 価格（COOL便）* (giá giao lạnh), 価格（ES配送便）* (giá giao ES).
