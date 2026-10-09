> **凍結（原典）2026-10-03：以降は更新しない。** 配送の仕様の正は `docs/01_仕様/10_配送/配送仕様/`、いま有効な決定は `docs/決定台帳.md`。トラブルの正は 配送仕様/配送_07_トラブル・代替品.md。

# Xử lý sự cố & hủy giao hàng — Luồng nghiệp vụ (bản cho dev)

**Ngày tạo:** 2026-09-21 · **Người tạo:** Hong (BrSE, Dipro)
**Cập nhật:** 2026-09-29 — bổ sung #34–#51 phần liên quan (hàng thay thế, cước khi `中止`, gửi trả hàng còn lại, nhãn hiển thị cho khách, driver chưa assign, chặng 1 do đối tác — 〔決定v2.3 #39〜#43 / #47〜#49〕) · 2026-09-29 — xem lại xử lý sự cố: auto-child tạo ngay khi báo cáo theo loại, resolve theo delivery, `partial_no_resend`, presumed `納品済` không tới (DEV spec v2.3 §13.2.1〜§13.2.3 / §15.12.1; bỏ §16.8.1) · 2026-09-24 — bổ sung quyết định trouble auto-child
**Sơ đồ đi kèm:** `ÉS/02_デモ/98_説明_配送トラブル中止フロー_vi.html` (mở bằng trình duyệt — xem hình trước, đọc file này sau)

> Tài liệu **chỉ dịch lại nội dung đã chốt**, không thêm quyết định mới.
> Nguồn: `ÉS/01_仕様/10_配送/納品サイクル設定_仕様書.md` (spec thiết lập chu kỳ giao hàng) §4A-3B / §4A-4B / §4A-4C / §4D-1 / §4D-3;
> `議事録/仕様/ピッキング出荷配送ドライバー_詳細要件仕様.md` (spec yêu cầu chi tiết pick–xuất kho–giao hàng–tài xế) §8G-4, §7.
> **Cập nhật 2026-09-24 (`2026/09/24 追補（トラブルの自動子）` = bổ sung 2026/09/24 — bản con tự động của sự cố, 〔決定v2.3 #20〜#26〕):** nguồn là `ÉS/01_仕様/10_配送/DEV仕様書_サイクル・出荷・ピッキング・配送_VI_v2.3.md` (DEV spec, **bản vẫn là v2.3**) §9.4 / §10.2 / §12.1 / §12.2 / §13.2.1 / §13.3 / §13.4 / §15.11 / §15.12 / §16.8.1 / §16.9 / §16.10 / §17.1 / §18, và §8P của spec yêu cầu chi tiết. **Lệch nhau thì DEV spec đúng.**
> **Cập nhật 2026-09-29 (`決定 v2.3 追補3` = bổ sung 3 của quyết định v2.3, 〔決定v2.3 #27〜#33〕):** nguồn là DEV spec (bản vẫn v2.3) §9.4 / §12.1 / §12.2 / §13.2 / §13.2.1 / §13.2.2 / §13.2.3 / §13.3 / §14.6 / §14.7 / §14.11 / §15.11 / §15.12 / §15.12.1 / §16.8.1 (đã bỏ) / §16.13 / §17.1 / §18. Tóm tắt:
> - #27: `納品済` (đã giao đủ) **chỉ khi `completion_source = presumed`** (coi như đã giao) mà hãng vận chuyển (Yamato) điều tra xác nhận không tới → vận hành resolve sang `再配達待` (chờ giao lại) / `中止` (dừng giao); không tính tiền, hóa đơn đã chốt thì điều chỉnh tháng sau.
> - #28: sự cố ở bản con → tạo **nhánh tiếp theo của parent gốc** (`-1` sự cố → `-2`), nội dung copy từ bản con bị sự cố.
> - #29: **resolve theo đơn vị delivery**; mỗi delivery phát sinh sự cố có **tối đa 1 auto-child còn sống** (`source_trouble_delivery_id`).
> - #30: auto-child **tạo ngay khi đăng ký báo cáo**, chỉ với loại `trouble_types.auto_child = true` (giao nhầm / vắng mặt / hư hỏng). Bỏ SLA, bỏ `auto_duplicate_due_at`, bỏ batch `trouble_auto_duplicate`. Báo cáo chưa resolve lên `要確認` (cần kiểm tra) loại `trouble_open`.
> - #31: thêm resolution “giao một phần, không giao phần còn lại” (`partial_no_resend`). #32: sự cố `遅延` (trễ) tự resolve khi tài xế báo giao đủ. #33: data model.
> - **Thay thế #22 / #25 (và một phần #26) của bản 2026-09-24.** Lệch nhau thì bản 2026-09-29 đúng.
> **Cập nhật 2026-09-29 (`決定 v2.3 追補4` = bổ sung 4 của quyết định v2.3, 〔決定v2.3 #34〜#51〕 — chỉ phần liên quan tài liệu này):** nguồn là DEV spec §9.4 / §11 / §12.4 / §13.1 / §13.4 / §13.5 / §14.4〜§14.7. Tóm tắt:
> - #39: `代替品` (hàng thay thế) ghi `delivery_lines.substituted_from_product_id` (sản phẩm gốc); tính tiền theo đơn giá sản phẩm gốc.
> - #40: cờ cước đổi tên `freight_billable` (cũ: `redelivery_billable`), dùng cho cả `再配達待` và `中止`; mặc định false, true thì bắt buộc lý do.
> - #41: hàng còn lại gửi về trụ sở bằng duplicate `return` (`返送` = gửi trả) — nơi giao = kho loại `warehouse_type = return`, `return_to_warehouse_id`, không tính tiền.
> - #42: nhãn hiển thị cho khách tách khỏi trạng thái (DEV §12.4) — `取消` có chuyến thay thế → 「配送日調整中」 (thay 「確認中」).
> - #43 / #48: `要確認` `assignment_missing` = tới **ngày trước ngày giao** mà leg cần assign chưa có tài xế; leg cần assign theo `delivery_regime` của leg (`self` / `partner_driver`), không theo chặng 1 / 2.
> - #47: chuyến đối tác đến kho lấy hàng → ES tự đánh số vận đơn (`issued_by = es_generated`). #49: `delivery_legs.picked_up_at` / `picked_up_by`; `受取済` chỉ ở lần nhận đầu tiên.
> **Tên trạng thái giữ nguyên tiếng Nhật** vì đó là giá trị dùng trong DB/UI — nhưng **mọi từ tiếng Nhật trong tài liệu này đều có nghĩa tiếng Việt đi kèm**. Tra nhanh ở §0.

---

## 0. Bảng thuật ngữ (tra ở đây trước)

### 0.1. Trạng thái giao hàng (状態 = trạng thái)

| Giá trị (dùng trong DB/UI) | Nghĩa tiếng Việt | Giải thích |
|---|---|---|
| `出荷待` | **Chờ xuất kho** | Đã tạo dữ liệu giao hàng, kho chưa xuất |
| `出荷済` | **Đã xuất kho** | Kho đã xuất (import CSV kết quả xuất kho / CSV vận đơn) |
| `受取済` | **Tài xế đã nhận hàng** | Nhận tại kho / điểm trung chuyển. Đang trên đường giao cũng là trạng thái này. **Chỉ vào được từ app tài xế của ES** — chuyến của hãng vận chuyển (Yamato…) không bao giờ có trạng thái này. Chỉ chuyển ở **lần nhận đầu tiên** bằng app ES (chặng 1 do đối tác → nhận tại kho); các lần nhận sau (tài xế chặng 2 nhận ở điểm trung chuyển) chỉ ghi `delivery_legs.picked_up_at` / `picked_up_by` của leg đó, trạng thái giữ nguyên 〔決定v2.3 #49〕 |
| `納品済` | **Đã giao đủ** | Giao đủ toàn bộ. Chuyến ủy thác ghi kèm `（みなし）` = *coi như đã giao*. Ngoại lệ duy nhất (2026-09-29): `（みなし）` mà xác nhận hàng không tới → vận hành resolve sang `再配達待` / `中止` (§3.1) |
| `一部納品済` | **Đã giao một phần** | Phần còn lại nằm ở bản nhân bản, bản đó bắt đầu từ `確認中` (đang xác minh) — **hoặc không giao phần còn lại** (`partial_no_resend`, không có bản con — 2026-09-29) |
| `再配達待` | **Chờ giao lại** | Giao được 0, sẽ gửi lại |
| `確認中` | **Đang xác minh** | Trong luồng sự cố **chỉ dùng cho bản con / recovery candidate chưa xuất kho** (`shipped_date IS NULL`), chờ vận hành chốt ngày, số lượng và hướng xử lý. **Bản gốc (parent) không chuyển sang `確認中` chỉ vì có báo cáo sự cố** — giữ `出荷済` / `受取済` / `納品済` (tên cũ: `トラブル` = sự cố, REQ-DL-313)（Cũ: nhận báo cáo sự cố → bản gốc thành `確認中`. 2026/09/24 bỏ〔決定v2.3 #20〕） |
| `中止` | **Dừng giao (kết thúc)** | Kết thúc mà không giao. Thực tế = 0, **bắt buộc nhập lý do** |
| `取消` | **Hủy (trước khi xuất kho)** | Hủy khi kho chưa xuất hàng. **Bắt buộc nhập lý do** |

### 0.2. Trục đơn xin đổi ngày (変更申請 = đơn xin thay đổi)

| Giá trị | Nghĩa |
|---|---|
| `変更可` | Được phép xin đổi |
| `申請中` | Khách đang xin đổi |
| `提案中` | Vận hành đang đề xuất ngày khác |
| `調整済` | Đã điều chỉnh xong (ngày do vận hành quyết) |
| `変更不可` | Không được đổi nữa (đã qua hạn chốt đơn) |

### 0.3. Trục trung chuyển (中継 = trung chuyển)

`中継なし` = **không có trung chuyển** · `中継あり` = **có trung chuyển**. Đây là **giá trị dẫn xuất từ tuyến giao, không lưu DB**.

### 0.4. Từ vựng nghiệp vụ khác

| Tiếng Nhật | Nghĩa tiếng Việt |
|---|---|
| `配送データ` | Dữ liệu giao hàng (delivery) — bản ghi giao hàng thực tế, **có** trạng thái |
| `納品予定` | Lịch giao dự kiến (plan) — bản nháp ngày giao, **không có** trạng thái (hiển thị `—`) |
| `確定生成` | Sinh chính thức — batch chuyển lịch dự kiến → dữ liệu giao hàng |
| `複製` | Nhân bản — tạo bản ghi giao hàng mới từ bản cũ, không sửa bản cũ |
| `枝番` | Số nhánh — hậu tố ID bản con (`DL-…-1`, `-2`…) |
| `分納` | Giao làm nhiều lần / giao bù — hôm nay giao một phần, còn lại giao sau |
| `再配達` | Giao lại |
| `代替便` | Chuyến thay thế |
| `代替品` | Hàng thay thế (giao sản phẩm khác thay hàng lỗi/thiếu). 1 dòng = sản phẩm thực giao, `delivery_lines.substituted_from_product_id` = sản phẩm gốc 〔決定v2.3 #39〕 |
| `廃棄` | Hủy bỏ hàng (VD: đồ đông lạnh bị chảy) + điều chỉnh tồn kho |
| `要確認` | Cần kiểm tra — danh sách việc tồn vận hành phải xử lý |
| `運営スケジュール` | Lịch vận hành — màn hình quản lý của vận hành, chứa mục *cần kiểm tra* |
| `出荷指示` | Chỉ thị xuất kho — lệnh gửi cho kho Thomas để pick & xuất hàng |
| `出荷実績CSV` | CSV kết quả xuất kho (kho trả về) |
| `送り状（番号）` | Vận đơn (số vận đơn) — ES không tự cấp, nhận từ hãng vận chuyển. **Ngoại lệ (2026-09-29):** chuyến đối tác đến kho lấy hàng → ES tự đánh số (`issued_by = es_generated`) 〔決定v2.3 #47〕 |
| `自社便` | Chuyến tự vận hành — tài xế của ES giao, có app tài xế |
| `委託便` | Chuyến ủy thác — hãng vận chuyển (Yamato…) giao |
| `みなし` | Coi như / mặc định — `納品済（みなし）` = coi như đã giao đủ |
| `欠配` / `欠配検知バッチ` | Không giao được / batch phát hiện không giao |
| `トラブル報告` | Báo cáo sự cố (thao tác trên app tài xế) |
| `トラブル種別` | Loại sự cố (master 6 loại) |
| `自動子` | Bản con tự động (auto-child) — hệ thống tạo **ngay khi đăng ký báo cáo sự cố** thuộc loại có `auto_child = true` (giao nhầm / vắng mặt / hư hỏng), tối đa 1 bản còn sống / delivery (§3A)（Cũ: batch tạo khi quá hạn. Bỏ 2026-09-29） |
| `数量差異` | Chênh lệch số lượng (khi kiểm hàng / giao hàng) |
| `納品後の連絡` | Liên hệ / khiếu nại sau khi đã giao |
| `運営（物流）` | Vận hành — bộ phận logistics; là người resolve bản gốc khi có sự cố |
| `代理登録` | Đăng ký thay — vận hành nhập hộ khi người báo không dùng app |
| `法人` | Khách hàng doanh nghiệp (công ty ký hợp đồng) |
| `拠点` | Cơ sở / điểm giao của khách |
| `契約` / `契約ID` | Hợp đồng / ID hợp đồng |
| `配送区分` | Phân loại giao hàng (theo vùng nhiệt độ: mát / đông / vật tư) |
| `配送ルート` | Tuyến giao (kho → điểm trung chuyển → nơi giao) |
| `納品日` / `ピッキング日` | Ngày giao hàng / ngày pick hàng (= ngày giao − lead time) |
| `配送実績` | Kết quả giao hàng thực tế (giờ hoàn thành, số đã giao, ghi chú) |
| `添付資料` | Tài liệu đính kèm (ảnh báo cáo, sơ đồ đường vào…) |
| `変更履歴` | Lịch sử thay đổi (log bắt buộc ghi mỗi lần đổi trạng thái) |
| `物流` | Bộ phận logistics (nhóm vận hành có quyền quyết định) |
| `一部未受取` | Nhận thiếu một phần (tài xế không nhận đủ số vận đơn tại kho) |
| `一部未配送のまま完了` | “Hoàn tất khi còn hàng chưa giao” (tên nút trên app tài xế) |
| `本社` | Trụ sở chính (nơi nhận lại hàng còn dư) — đăng ký ở master kho với `warehouse_type = return` 〔決定v2.3 #41〕 |
| `返送` | Gửi trả — duplicate `duplicate_type = return` gửi hàng còn lại về điểm gửi trả (trụ sở…) (§5) 〔決定v2.3 #41〕 |
| `配送日調整中` | “Đang điều chỉnh ngày giao” — nhãn hiển thị cho khách khi `取消` có chuyến thay thế (§2, DEV §12.4) 〔決定v2.3 #42〕 |
| `決定済み` / `提案` | Đã chốt / mới là đề xuất (trạng thái của từng yêu cầu REQ) |
| `N件` | N đơn / N bản ghi |

**Lưu ý chung**
- `納品予定` (lịch giao dự kiến, draft) **không có trạng thái** → hiển thị `—`. Khi `確定生成` (sinh chính thức) mới thành `出荷待` (chờ xuất kho).
- `代替品` (hàng thay thế) và `廃棄` (hủy bỏ hàng) **không phải trạng thái**, chỉ là thao tác đi kèm. Trạng thái luôn do **số lượng giao được thực tế** quyết định.
- Chuyển trạng thái **chỉ được phép theo đúng bảng §4A-3B** của spec gốc (và bảng transition DEV spec §12.2); transition ngoài bảng phải bị chặn (REQ-DL-756).

---

## 1. Nguyên tắc lớn

Sau khi `locked` (đã khóa — tức đã xuất chỉ thị xuất kho cho Thomas), **không được ghi đè ngày giao**. Không sửa dữ liệu quá khứ — xử lý bằng **`取消` (hủy)** hoặc **`複製` (nhân bản — tạo bản ghi con có số nhánh)**. Lý do: phục vụ tính tiền và audit — phải giải thích được “vì sao hàng không tới”.

| Nội dung | Quy định |
|---|---|
| Ai được đặt `取消` (hủy) / `中止` (dừng giao) / `再配達待` (chờ giao lại) | **Chỉ vận hành (`物流` = logistics)**. Tài xế và hãng vận chuyển chỉ được **báo cáo** |
| Lý do | **Bắt buộc** với mọi thao tác. Chọn từ master 6 loại + nhập text bổ sung |
| Lịch sử | Mỗi lần đổi trạng thái ghi 1 dòng `変更履歴` (lịch sử thay đổi). VD: `受取済 → 中止：người nhận vắng mặt` (tài xế đã nhận hàng → dừng giao). **Không cho phép đổi trạng thái mà không có dòng lịch sử** |
| Không làm | **Không tạo UI chỉ đổi mỗi trạng thái.** Bắt buộc đi qua màn hình “quyết định hướng xử lý” (§4A-4B của spec gốc) |
| Hiển thị | Cạnh trạng thái phải hiện **lý do / thời điểm đăng ký / người đăng ký** |

---

## 2. Lối vào ① — Phát hiện “không giao được” **trước khi xuất kho**

Ví dụ: kho hỏng thiết bị, không điều được xe, tuyết lớn.

| Bước | Xử lý |
|---|---|
| 1 | Vận hành (`物流` = logistics) đặt đơn về **`取消` (hủy)** — bắt buộc lý do, lưu lịch sử |
| 2 | **Gửi lại `出荷指示` (chỉ thị xuất kho) với số lượng = 0** để triệt tiêu chỉ thị cũ. Kho Thomas **không có giao diện hủy** — chỉ ghi đè bằng bản gửi lại có số version (§4D-3). Nếu kho đã bắt đầu pick hàng thì chuyển sang gọi điện |
| 3 | Nếu chạy chuyến thay thế: **`複製` (nhân bản)** tạo đơn giao hàng mới — bản gốc vẫn giữ nguyên ở `取消` (đã hủy) |
| 4 | Phía màn hình khách hàng (`法人` = khách hàng doanh nghiệp) hiển thị nhãn **「配送日調整中」** (đang điều chỉnh ngày giao) nếu có chuyến thay thế (child `alternative` còn sống), không có thì **「お届け中止」** (dừng giao); vận hành truyền đạt tình hình qua comment. Khách **không** nhìn thấy chữ `取消` (đã hủy). Nhãn suy ra, không lưu; web vận hành giữ nguyên tên trạng thái (DEV §12.4) 〔決定v2.3 #42〕（Cũ: hiển thị là `確認中` (đang xác minh). Bỏ 2026-09-29） |

**Nhãn hiển thị cho khách (DEV §12.4, 2026-09-29)** 〔決定v2.3 #42〕 — tách khỏi trạng thái, web vận hành không đổi:

| Trạng thái / tình huống phía vận hành | Nhãn trên web khách hàng |
|---|---|
| `取消` và có chuyến thay thế | 配送日調整中 (đang điều chỉnh ngày giao) |
| Có báo cáo sự cố chưa resolve (trạng thái giữ `出荷済` …) | Trạng thái như cũ + ghi chú 「配送状況を確認中です」 (đang kiểm tra tình trạng giao hàng) |
| Bản con `確認中` | 再配送準備中 (đang chuẩn bị giao lại) |
| `一部納品済` | 一部お届け済み (đã giao một phần) |
| `再配達待` | 再配送予定 (sẽ giao lại) |
| `取消` không có chuyến thay thế · `中止` | お届け中止 (dừng giao) |

---

## 3. Lối vào ② — Sự cố **sau khi xuất kho / đang giao / sau khi giao**

Ví dụ: tai nạn, trễ, vỡ/hỏng, điểm giao không nhận được hàng, `数量差異` (chênh lệch số lượng), `納品後の連絡` (khách liên hệ / khiếu nại sau khi đã giao).

Tài xế / hãng vận chuyển / khách hàng báo cáo → hệ thống **ghi `トラブル報告` (báo cáo sự cố) và mở mục `要確認` (cần kiểm tra)**. **Trạng thái của bản ghi gốc (parent) KHÔNG đổi** 〔決定v2.3 #20〕 (DEV spec §12.2 / §13.2.1):

| Lúc phát sinh sự cố | Trạng thái parent sau khi báo cáo |
|---|---|
| Đã xuất kho | Giữ **`出荷済`** (đã xuất kho) |
| Tài xế đã nhận hàng / đang giao (kể cả `数量差異` = chênh lệch số lượng, `一部未配送のまま完了` = hoàn tất khi còn hàng chưa giao) | Giữ **`受取済`** (tài xế đã nhận hàng) |
| `納品後の連絡` (khiếu nại sau khi giao) | Giữ **`納品済`** (đã giao đủ) — **không** đưa về `確認中` (đang xác minh) |

（Cũ: `出荷済` / `受取済` → `確認中` khi có báo cáo sự cố; `納品済` → `確認中` khi có khiếu nại sau giao. 2026/09/24 bỏ.）

- **`確認中` (đang xác minh) trong luồng sự cố chỉ dùng cho bản con / recovery candidate chưa xuất kho** (`shipped_date IS NULL`). Parent không bao giờ vào `確認中` vì trouble.
- Báo cáo nằm trong `要確認` (cần kiểm tra) cho tới khi **`運営（物流）` (vận hành — bộ phận logistics)** resolve. **Batch không tự chọn cách resolve cho parent.**
- Nếu loại sự cố có `auto_child = true` (`誤配送` giao nhầm / `不在・受け取り不可` vắng mặt / `破損・品質不良` hư hỏng) → hệ thống tạo **`自動子` (bản con tự động) ngay trong transaction đăng ký báo cáo** — xem §3A 〔決定v2.3 #30〕.
- Mỗi báo cáo chưa resolve nằm trong `要確認` loại `trouble_open` (đối tượng = delivery) — kể cả loại không tạo auto-child.（Cũ: quá `auto_duplicate_due_at` mà chưa resolve thì batch tạo auto-child. Bỏ 2026-09-29.）

### 3.1. `運営（物流）` (vận hành logistics) resolve parent trực tiếp 〔決定v2.3 #21 / #27 / #29 / #31〕

**Resolve theo đơn vị delivery** 〔決定v2.3 #29〕: một lần resolve đóng **toàn bộ** báo cáo sự cố chưa resolve của delivery đó, ghi cùng `resolution` / `resolved_at` / `resolved_by` / `resolution_reason` vào từng báo cáo.

| Resolution (cách xử lý) | Parent chuyển sang | Parent đi từ | `自動子` (bản con tự động) — nếu đã có |
|---|---|---|---|
| Giao đủ toàn bộ (kể cả bằng `代替品` = hàng thay thế — ghi `delivery_lines.substituted_from_product_id` = sản phẩm gốc, tính tiền theo giá sản phẩm gốc 〔決定v2.3 #39〕). Thừa thì điều chỉnh lần sau | `納品済` (đã giao đủ) | `出荷済` / `受取済` / `納品済` | → `取消` (hủy), lý do `auto child not needed` |
| Giao được một phần, phần còn lại giao sau | **`一部納品済`** (đã giao một phần) — chốt theo số lượng giao thực tế | `出荷済` / `受取済` | **Dùng lại (reuse)**: `duplicate_type=remainder`, số lượng / `delivery_lines` = phần còn lại |
| **Giao được một phần, không giao phần còn lại** (`partial_no_resend`) 〔決定v2.3 #31〕 | **`一部納品済`** (đã giao một phần) — chốt theo số thực giao; phần thiếu không tính tiền. **Không tạo bản con**. Không có ngưỡng số lượng — vận hành quyết, **bắt buộc lý do** | `出荷済` / `受取済` | → `取消` (hủy) |
| Giao được 0, sẽ gửi lại toàn bộ | **`再配達待`** (chờ giao lại) | `出荷済` / `受取済` | **Dùng lại (reuse)**: `duplicate_type=redelivery`, số lượng / `delivery_lines` = toàn bộ |
| Quay lại giao trong cùng ngày (trễ giờ…) | `受取済` (tài xế đã nhận hàng) | `出荷済` / `受取済` | → `取消` (hủy) |
| Không giao, kết thúc luôn | **`中止`** (dừng giao) — thực tế = 0, bắt buộc lý do. Không tính tiền hàng; cước theo `freight_billable` (mặc định false, true thì bắt buộc lý do). Hàng còn lại gửi về trụ sở bằng duplicate `return` (§5) 〔決定v2.3 #40 / #41〕 | `出荷済` / `受取済` | → `取消` (hủy) |
| Hãng vận chuyển điều tra xác nhận hàng **không tới**, giao lại toàn bộ 〔決定v2.3 #27〕 | **`再配達待`** (chờ giao lại) — không tính tiền | **Chỉ `納品済` với `completion_source = presumed`** (coi như đã giao) | **Dùng lại (reuse)** nếu có, không có thì tạo bản con: `duplicate_type=redelivery`, toàn bộ số lượng |
| Hãng vận chuyển điều tra xác nhận hàng **không tới**, không giao nữa 〔決定v2.3 #27〕 | **`中止`** (dừng giao) — không tính tiền, bắt buộc lý do | **Chỉ `納品済` với `completion_source = presumed`** | → `取消` (hủy) |

- **Ngoại lệ của `納品済` (#27):** bình thường từ `納品済` chỉ resolve được “giao đủ”. Riêng `納品済（みなし）` (`completion_source = presumed`): khách báo chưa nhận → vận hành đăng ký thay báo cáo sự cố, yêu cầu Yamato điều tra (ngoài hệ thống); xác nhận thất lạc / không giao → `再配達待` / `中止`. **Không áp dụng** cho `納品済` do tài xế báo (`reported`) hoặc khách xác nhận nhận hàng (`customer`). Hóa đơn đã chốt → không sửa ngược, điều chỉnh (hoàn tiền / bù trừ) tháng sau.
- **Chưa quyết (#27):** trường hợp **chỉ một phần thùng không tới** — có cho chuyển sang `一部納品済` (đã giao một phần) hay không.
- **Tự resolve `遅延` (trễ)** 〔決定v2.3 #32〕: delivery mà báo cáo chưa resolve **chỉ toàn loại `delay`**, và tài xế báo **giao đủ** (`delivered_qty = planned_qty`) → cùng transaction với `受取済 → 納品済`, hệ thống resolve các báo cáo đó = giao đủ (`resolved_by` = system, `actor_type=system`) và đóng `要確認` `trouble_open`. Còn báo cáo loại khác hoặc số giao khác dự kiến → không tự resolve, vận hành resolve. Trễ không giao được trong ngày → vẫn nằm trong `要確認`.

- Actor: **`運営（物流）`** (vận hành logistics). Lý do bắt buộc. Parent phải còn ở `出荷済` / `受取済` / `納品済`, auto-child (nếu có) phải đang `確認中` (DEV §15.12).
- 1 transaction: resolution của mọi báo cáo chưa resolve + trạng thái delivery + cập nhật / hủy auto-child + đóng `要確認` loại `trouble_open` và `trouble_auto_child_pending` + audit (DEV §17.1).
- **Không tạo bản con thứ hai** khi delivery đã có auto-child còn sống (theo `source_trouble_delivery_id`). API `複製` (nhân bản) thủ công cũng phải dùng lại bản con đó; cố tạo thêm → lỗi `DOMAIN_TROUBLE_CHILD_EXISTS`.
- Chưa có auto-child (loại không tạo auto-child như `数量相違` / `遅延` / `その他`, hoặc loại chưa xác định) thì `一部納品済` / `再配達待` tạo bản con bằng `複製` (nhân bản) như cũ — bản con bắt đầu ở `確認中`.

（Cũ: các lối ra trên đi từ `確認中` của parent — `確認中` → `納品済` / `一部納品済` / `再配達待` / `中止` / `受取済`. 2026/09/24 bỏ.）

### 3.2. Hai điểm quan trọng nhất khi implement

1. **Phần giao được thì chốt trước.** Bản ghi gốc chốt ngay theo số lượng thực giao — `一部納品済` (đã giao một phần) / `再配達待` (chờ giao lại) — **không chờ quyết định phần còn lại rồi mới chốt thực tế**.
2. **Bản con luôn được tạo ở `確認中` (đang xác minh)** — quyết định 2026/09/18, REQ-DL-649-2. Ngày nhập lúc đó chỉ là **ngày tạm**; ngày pick hàng tính ngược từ ngày tạm đó.
   - Bản con được đẩy lên **`要確認` (cần kiểm tra)** với nhãn “chờ xử lý số còn lại” / “chờ xác nhận ngày giao lại”.
   - Vận hành xác nhận, chọn 1 trong 3: **`この日で確定` (chốt đúng ngày này)** → `出荷待` (chờ xuất kho) / **`日付を変更` (đổi ngày)** → `出荷待` (chờ xuất kho) / **`中止` (dừng giao)** → `中止`. Mọi lựa chọn đều ghi lý do + lịch sử.
   - **Lý do không cho vào `出荷待` (chờ xuất kho) ngay:** `出荷指示` (chỉ thị xuất kho) được xuất **tự động, gộp 2 tuần một lần, trước ngày bắt đầu 3 ngày**. Nếu để ngày tạm lọt vào đó, kho sẽ chạy theo một ngày mà **không ai đã kiểm tra**.
   - **Bản con đang `確認中` (đang xác minh) bị loại khỏi đối tượng xuất chỉ thị xuất kho** (REQ-DL-801). Không được tồn tại trạng thái “đã có lịch sử chỉ thị xuất kho nhưng vẫn đang `確認中` (đang xác minh)”.
   - Với `自動子` (bản con tự động, `duplicate_type=trouble_pending`): `確認中 → 出荷待` còn cần `schedule_confirmed=true` **và** `quantity_confirmed=true` sau khi vận hành đã resolve parent; nếu resolution không cần giao lại (kể cả `partial_no_resend`) thì bản con → `取消` (hủy) trong cùng transaction (§3A).

### 3A. `自動子` (bản con tự động — auto-child) tạo ngay khi báo cáo, theo loại sự cố 〔決定v2.3 #23 / #24 / #28〜#30 / #33〕

Nguồn: DEV spec §9.4 / §13.2.1 / §15.11 / §15.12.1 / §14.6 / §14.7 / §17.1.

（Cũ: batch `trouble_auto_duplicate` tạo auto-child khi quá `auto_duplicate_due_at = reported_at + trouble_auto_duplicate_after_minutes`, `creation_source = trouble_timeout`, 1 báo cáo = 1 bản con theo `source_trouble_report_id` — bỏ ngày 2026-09-29, thay #22 / #25.）

**Khi nào tạo:** **ngay trong transaction đăng ký báo cáo sự cố** — không chờ SLA. Không còn hạn tính toán, không còn cấu hình số phút, **không có batch**.

**Tạo hay không — theo master `trouble_types.auto_child`** (giá trị ban đầu; vận hành logistics sửa được):

| Loại (`code`) | Tiếng Nhật | Auto-child | Lý do |
|---|---|---|---|
| `wrong_delivery` | `誤配送` (giao nhầm) | **Tạo** | Gần như luôn phải thu hồi + giao lại |
| `absent` | `不在・受け取り不可` (vắng mặt / không nhận được) | **Tạo** | Gần như luôn phải giao lại |
| `damage` | `破損・品質不良` (hư hỏng / lỗi chất lượng) | **Tạo** | Cần chuẩn bị `代替品` (hàng thay thế) / giao lại |
| `qty_diff` | `数量相違` (sai số lượng) | Không | 1–2 cái có thể không gửi; vận hành chọn gửi / không gửi lúc resolve (§3.1, `partial_no_resend`) |
| `delay` | `遅延` (trễ) | Không | Giao được trong ngày thì không cần; tự resolve khi tài xế báo giao đủ (§3.1) |
| `other` | `その他` (khác) | Không | Vận hành quyết từng ca |

- **Loại lúc báo cáo lấy từ lựa chọn trên app tài xế** qua `trouble_app_reasons`. Lựa chọn 「商品不足・誤配送」 (thiếu hàng / giao nhầm — thuộc 2 loại) → **loại chưa xác định** (`type_code = NULL`) → **không tạo**. Khi vận hành phân loại sang loại có `auto_child = true` → **tạo auto-child tại thời điểm phân loại** (cùng transaction). Đổi sang loại `auto_child = false` **không** tự hủy bản con đã tạo — vận hành xử lý lúc resolve 〔決定v2.3 #30〕.
- Vận hành `代理登録` (đăng ký thay) → xét theo loại vận hành chọn.
- Loại không tạo auto-child: báo cáo chưa resolve vẫn nằm trong `要確認` loại `trouble_open` → không bị sót.

**Điều kiện tạo** — phải thỏa **tất cả**:

- Có `トラブル報告` (báo cáo sự cố) chính thức — **không tạo bản con chỉ vì đơn chưa giao xong**.
- Loại có `auto_child = true`.
- Delivery phát sinh sự cố đang ở `出荷済` (đã xuất kho) / `受取済` (tài xế đã nhận hàng) / `納品済` (đã giao đủ).
- Delivery đó **chưa có auto-child còn sống** (khác `取消`) theo `source_trouble_delivery_id`. Báo cáo thứ 2, 3… của cùng delivery **không** tạo thêm — dùng lại bản con hiện có 〔決定v2.3 #29〕.

**Bản con được tạo:**

| Cột | Giá trị |
|---|---|
| `status` | `確認中` (đang xác minh) |
| `duplicate_type` | `trouble_pending` |
| `creation_source` | `trouble_auto` (đổi tên từ `trouble_timeout`) |
| `source_trouble_delivery_id` | ID delivery phát sinh sự cố (parent hoặc một bản con). Unique: `UNIQUE(source_trouble_delivery_id) WHERE creation_source = 'trouble_auto' AND status <> '取消'` |
| `source_trouble_report_id` | ID báo cáo đầu tiên đã tạo bản con — **chỉ để tra cứu**, không còn unique |
| `schedule_confirmed` / `quantity_confirmed` | `false` / `false` |

- Copy như `複製` (nhân bản) từ **delivery phát sinh sự cố**: snapshot nơi giao, điều kiện giao, khung giờ nhận, toàn bộ `delivery_legs`. **Không copy** vận đơn, phân công tài xế, tài liệu đính kèm. Chỉ 1 cấp cha–con, `枝番` (số nhánh) 1–9.
- **Sự cố ở bản con** 〔決定v2.3 #28〕: không nhân bản từ bản con. Tạo **nhánh tiếp theo của parent gốc** (VD: `DL-…-0014-1` bị sự cố → bản mới `DL-…-0014-2`, `parent_delivery_id` = `-0014`), nội dung copy từ **chính bản con bị sự cố**. Bản con bị sự cố tự nó được resolve như delivery khác. Vượt nhánh 9 → `DOMAIN_BRANCH_LIMIT` + lên `要確認` để vận hành quyết. Áp dụng cho cả auto-child lẫn `複製` thủ công.
- Ngày giao = **ngày ứng viên tạm, chỉ để hiển thị**. Số lượng = **mức tối đa có thể phải giao lại (tạm)** — không dùng cho xuất kho / tính tiền.
- **Parent không đổi trạng thái.** Hệ thống không tự chọn resolution.
- 1 transaction (đăng ký / phân loại): báo cáo sự cố + lock delivery + auto-child + UPSERT `要確認` `trouble_open` (đối tượng = delivery) và `trouble_auto_child_pending` (đối tượng = bản con) + audit (`actor_type=system` cho phần hệ thống tạo). Retry / tranh chấp đồng thời được chặn bởi unique ở trên.

**Trước khi vận hành xác nhận, bản con bị loại khỏi:** `出荷指示` (chỉ thị xuất kho), `送り状` (vận đơn), phân công tài xế, tính tiền, thông báo, `みなし` (coi như đã giao). Điều kiện gửi chỉ thị xuất kho có thêm: `schedule_confirmed=true` và `quantity_confirmed=true`, và không còn `duplicate_type=trouble_pending` chưa được vận hành resolve (〔決定v2.3 #23 / #24〕 vẫn giữ).

**Ra khỏi `確認中` (đang xác minh):**

- `確認中 → 出荷待` (chờ xuất kho): **chỉ khi** vận hành đã resolve parent (§3.1) và chốt số lượng + ngày giao, set `quantity_confirmed=true`, `schedule_confirmed=true`. Chưa chốt → lỗi `DOMAIN_TROUBLE_CHILD_UNCONFIRMED`.
- `確認中 → 取消` (hủy): khi resolution không cần giao lại (parent → `納品済` / `受取済` / `中止`, hoặc `一部納品済` với `partial_no_resend`), trong cùng transaction với resolve parent, bắt buộc lý do.
- Đóng `要確認` loại `trouble_open` và `trouble_auto_child_pending` trong cùng transaction.

**Batch liên quan:** không còn batch tạo auto-child（Cũ: `trouble_auto_duplicate` chạy trước `delivery_presume_complete` / `delivery_detect_missing` — bỏ 2026-09-29, DEV §16.8.1）. Điều kiện của 2 batch dưới giữ nguyên:

- `delivery_presume_complete` (batch `みなし` = coi như đã giao): chỉ `status = 出荷済`, final leg `parcel_carrier`, **không có trouble chưa resolve**.
- `delivery_detect_missing` (batch phát hiện `欠配` = không giao được): chỉ `status IN (出荷済, 受取済)`, final leg `self` / `partner_driver`, **không có trouble chưa resolve**.

**Dữ liệu (chuẩn là DEV spec §14):**

- `trouble_types` (mới): `code` (6 loại) · `name` · `default_action` · **`auto_child`** (boolean) · `sort_order` · `status`.
- `trouble_app_reasons` (mới): `app_reason_raw` (PK) → `type_code` (`NULL` = chưa xác định, cho 「商品不足・誤配送」).
- `trouble_reports`: `type_code` cho phép `NULL`; `resolution(full|partial|partial_no_resend|redelivery|same_day_revisit|stop)`; `resolved_by` có thể là system; **bỏ `auto_duplicate_due_at`**.
- `deliveries`: `duplicate_type(remainder|redelivery|alternative|trouble_pending)`, `creation_source(materialize|ops_duplicate|trouble_auto)`, **`source_trouble_delivery_id`** (unique như trên), `source_trouble_report_id` (chỉ tham chiếu; `UNIQUE(source_trouble_report_id)` **đã bỏ**), `schedule_confirmed`, `quantity_confirmed`.
- `review_items.kind`: thêm **`trouble_open`** (báo cáo chưa resolve, đối tượng = delivery); giữ `trouble_auto_child_pending`.
- Cấu hình vận hành: **bỏ** `trouble_auto_duplicate_after_minutes`.
- Mã lỗi: `DOMAIN_TROUBLE_CHILD_EXISTS`, `DOMAIN_TROUBLE_CHILD_UNCONFIRMED`, `DOMAIN_BRANCH_LIMIT`.

---

## 4. Master loại sự cố (`トラブル種別` = loại sự cố) — 6 phân loại, 1 hệ thống duy nhất

Trước đây mỗi màn hình có bộ phân loại riêng (2 hệ). Đã thống nhất thành **master 6 loại**, mỗi loại gắn sẵn hướng xử lý mặc định (quyết định 2026/09/13 · REQ-DL-657).

| Giá trị master | Nghĩa tiếng Việt | Hướng xử lý mặc định |
|---|---|---|
| `数量相違` | Sai số lượng (thiếu/thừa) | Thiếu → `複製` (nhân bản) giao bổ sung / Thừa → điều chỉnh lần sau |
| `誤配送` | Giao nhầm | Thu hồi + `複製` (nhân bản) giao lại |
| `破損・品質不良` | Hư hỏng / lỗi chất lượng | Xử lý bằng `代替品` (hàng thay thế), hoặc đăng ký `廃棄` (hủy bỏ hàng) |
| `不在・受け取り不可` | Vắng mặt / không nhận được | `複製` (nhân bản) giao lại |
| `遅延` | Trễ (kẹt xe, tai nạn, thời tiết) | Quay lại trong ngày, hoặc `複製` (nhân bản) sang hôm sau |
| `その他` | Khác | Bắt buộc nhập lý do, vận hành quyết định từng ca |

- Hướng xử lý mặc định chỉ là **gợi ý**; người chọn cuối cùng là vận hành (vẫn bắt buộc nhập lý do).
- Từ 2026-09-29 master là bảng `trouble_types` có cờ **`auto_child`**: `誤配送` / `不在・受け取り不可` / `破損・品質不良` = tạo auto-child ngay khi báo cáo; `数量相違` / `遅延` / `その他` = không tạo (§3A) 〔決定v2.3 #30 / #33〕. Lựa chọn trên app tài xế map sang loại qua `trouble_app_reasons`; 「商品不足・誤配送」 = chưa xác định, vận hành phân loại sau.
- Người báo cáo **không chỉ là tài xế**: với `委託便` (chuyến ủy thác), thông tin đến từ khách hàng / cơ sở nhận hàng / hãng vận chuyển → **phải có màn hình cho vận hành nhập hộ (`代理登録` = đăng ký thay)**.

---

## 5. `複製` (nhân bản) — một thao tác dùng chung cho 3 mục đích

`分納` (giao bù), `再配達` (giao lại), `代替便` (chuyến thay thế) đều là **“không sửa bản gốc, tạo thêm 1 đơn giao hàng cùng nội dung”**. Không làm 3 chức năng riêng — làm **1 chức năng nhân bản** rồi phân biệt bằng lý do.

**Copy / không copy**

| Copy sang bản con | KHÔNG copy (nhập mới) |
|---|---|
| `契約ID` (ID hợp đồng) · `法人` (khách hàng DN) · `拠点` (cơ sở nhận hàng) · `配送区分` (phân loại giao hàng theo vùng nhiệt độ) | `納品日` (ngày giao) · `ピッキング日` (ngày pick hàng) |
| `配送ルート` (tuyến giao): kho pick, điểm `中継` (trung chuyển), hãng vận chuyển | `送り状番号` (số vận đơn) — phát hành lại; điểm trung chuyển không phát hành |
| Snapshot nơi giao (địa chỉ, SĐT, người phụ trách, ghi chú) — **trừ `返送` (gửi trả): thay bằng địa chỉ điểm gửi trả** 〔決定v2.3 #41〕 | Số lượng (phân bổ, xem dưới) |
| Tham chiếu tài liệu đính kèm của địa điểm | `配送実績` (kết quả giao thực tế), tiền thu hộ, phân công tài xế, **số túi giữ lạnh / số đá khô** (bản con là kiện hàng khác) |

**Số nhánh (`枝番`) & quan hệ cha–con**

- ID bản con = ID gốc + số nhánh: `DL-260820-0012` → `DL-260820-0012-1`, tiếp theo `-2`…
- Tham chiếu cha bằng `parent_delivery_id`. **Chỉ 1 cấp cha–con** (không có cháu), số nhánh tối đa 9.
- Sự cố ở bản con → tạo **nhánh tiếp theo của parent gốc**, copy nội dung từ bản con bị sự cố (`-1` → `-2`); vượt 9 → `DOMAIN_BRANCH_LIMIT` + `要確認` 〔決定v2.3 #28〕.
- Số chỉ thị trong file CSV chỉ thị xuất kho dùng đúng số nhánh này, phía kho Thomas coi là unique ID (REQ-DL-114).

**Phân bổ số lượng**

| Mục đích | Bản gốc | Bản nhân bản |
|---|---|---|
| **`分納`** (giao bù — hôm nay giao một phần, còn lại giao sau) | Chốt theo số thực giao → `一部納品済` (đã giao một phần) — vận hành resolve trực tiếp từ `出荷済` / `受取済` | Số còn lại, **ngày giao tạm**, `確認中` (đang xác minh). **Nếu đã có `自動子` (bản con tự động) thì dùng lại nó** (`duplicate_type=remainder`), không tạo bản thứ hai. Chọn `partial_no_resend` thì **không có bản con** (auto-child → `取消`) |
| **`再配達`** (giao lại phần không tới được) | Giữ nguyên số lượng → `再配達待` (chờ giao lại) — vận hành resolve trực tiếp từ `出荷済` / `受取済` | Số không giao được, **ngày giao lại tạm**, `確認中` (đang xác minh). **Nếu đã có `自動子` thì dùng lại nó** (`duplicate_type=redelivery`), không tạo bản thứ hai |
| **`自動子`** (bản con tự động — tạo ngay khi báo cáo sự cố loại `auto_child = true`, tối đa 1 bản còn sống / delivery) | **Giữ nguyên trạng thái** (`出荷済` / `受取済` / `納品済`) cho tới khi vận hành resolve (§3.1) | Số lượng tối đa tạm, ngày ứng viên tạm, `確認中`, `trouble_pending`; bị loại khỏi xuất kho / tính tiền cho tới khi xác nhận (§3A) |
| **`代替便`** (hủy trước khi xuất kho, chạy chuyến khác) | → `取消` (hủy), giữ nguyên số lượng | Toàn bộ số lượng; đổi kho / hãng vận chuyển |
| **`返送`** (gửi trả — `duplicate_type = return`, 2026-09-29) 〔決定v2.3 #41〕 | Giữ nguyên (thường là `中止` / `一部納品済`) | Số còn lại; **nơi giao đổi sang điểm gửi trả** (`warehouses.warehouse_type = return`, VD trụ sở): set `return_to_warehouse_id`, snapshot địa chỉ / tên nơi giao = của điểm gửi trả. **Không tính tiền.** 1 cấp cha–con, số nhánh như nhân bản khác |

**Điều kiện sử dụng**

- Nhân bản được từ **cả `draft` (nháp) / `published` (đã phát hành) / `locked` (đã khóa)** — vì nhân bản là *tạo mới*, không ghi đè bản gốc.
- **Xuất từ kho khác ⇒ coi là `代替品` (hàng thay thế)** — quyết định 2026/09/14, REQ-DL-678. Nếu kho mới không có mã hàng đó thì bắt chọn lại sản phẩm; nếu có thì nhân bản bình thường.
- Chỉ vận hành (`物流` = logistics) thực hiện được. **Bắt buộc chọn lý do** — `分納` (giao bù) / `再配達` (giao lại) / `代替便` (chuyến thay thế) / `返送` (gửi trả, 2026-09-29) / `その他` (khác) — **+ nhập text**, ghi vào `変更履歴` (lịch sử thay đổi).
- **Chỉ `返送` (gửi trả) được đổi nơi giao**; các lý do khác giữ nơi giao của bản gốc 〔決定v2.3 #41〕.
- Bản nhân bản cũng lên `要確認` (cần kiểm tra) để không bị bỏ quên khi thiếu ngày / vận đơn / tài xế.

---

## 6. Cái gì vẫn sửa được sau khi `納品済` (đã giao đủ)

Cái bị “đóng” là **ngày / tuyến giao / số lượng dự kiến**, còn **thực tế và tài liệu đính kèm thì không đóng** (báo cáo sót của tài xế, ảnh gửi muộn, sửa tiền thu hộ).

| Đối tượng | Khi đã `納品済` (đã giao đủ) |
|---|---|
| `納品日` (ngày giao) · `ピッキング日` (ngày pick hàng) | **Không sửa được** — xử lý bằng `取消` (hủy) / `複製` (nhân bản) |
| Kho, hãng vận chuyển, điểm trung chuyển, lead time | **Không sửa được** |
| Số lượng dự kiến | **Không sửa được** |
| **`配送実績`** (kết quả giao thực tế: giờ hoàn thành, số đã giao, ghi chú) | **Sửa được** — bắt buộc lý do + ghi lịch sử |
| **`添付資料`** (tài liệu đính kèm: ảnh trưng bày trước/sau, đỗ xe, thu hộ) | **Thêm / thay được** — ghi lịch sử |

→ Do tính tiền dựa trên thực tế giao, **việc sửa thực tế thuộc tháng đã chốt hóa đơn KHÔNG ghi đè ngược hóa đơn**, mà phản ánh vào điều chỉnh của tháng sau.

---

## 7. Ảnh hưởng sang tính tiền / tồn kho / liên kết ngoài

| Hạng mục | Quy định |
|---|---|
| `中止` (dừng giao) | **Loại khỏi hóa đơn tháng đó. Không chuyển sang kỳ sau** (§4D-1). Không tính tiền hàng; **cước theo `freight_billable`** (mặc định không tính, tính thì bắt buộc lý do) 〔決定v2.3 #40〕 |
| `代替品` (hàng thay thế) | **Tính tiền theo mã hàng gốc** — dòng hàng thay thế ghi `delivery_lines.substituted_from_product_id` = sản phẩm gốc, billing lấy đơn giá sản phẩm gốc. Ghi khi vận hành resolve “giao đủ bằng hàng thay thế” hoặc sửa thực tế (chỉ vận hành, bắt buộc lý do) 〔決定v2.3 #39〕. Phản ánh vào phiếu giao hàng khách tải về (REQ-DL-316) |
| Phí `再配達` (giao lại) / cước khi `中止` | **Không áp dụng đồng loạt** — chọn “tính / không tính” theo từng ca bằng cờ **`deliveries.freight_billable`**, dùng chung cho `再配達待` và `中止`. **Mặc định: không tính (false)**; tính (true) thì bắt buộc lý do 〔決定v2.3 #40〕（Cũ: cờ `redelivery_billable`, chỉ cho giao lại — đổi tên 2026-09-29） |
| `廃棄` (hủy bỏ hàng — VD: đồ đông lạnh bị chảy) | Đăng ký hủy + điều chỉnh tồn kho. **Hàng đã hủy không quay về đâu cả.** Số lượng hủy ghi `delivery_lines.disposed_qty` theo từng sản phẩm. Phần hiện vật còn lại: **duplicate `return` (`返送` = gửi trả)** về điểm gửi trả (`warehouse_type = return`, VD `本社` trụ sở chính) — `return_to_warehouse_id`, số lượng = số còn lại, **không tính tiền** (§5) 〔決定v2.3 #41〕（Cũ: “tạo 1 đơn giao hàng với nơi giao = `本社`” — quyết định 2026/09/14; cụ thể hóa 2026-09-29） |
| `分納` (giao làm nhiều lần) | Tính tiền **theo thực tế giao**, ghi nhận vào **tháng dương lịch của ngày giao thực tế**. Vắt qua tháng thì mỗi phần vào tháng của nó. **Số còn lại không giao được thì không tính tiền** |
| Quan hệ cha–con (`枝番` = số nhánh) | Chỉ là cách gộp chứng từ, **không quyết định tiền thuộc về tháng nào** |
| `出荷指示` (chỉ thị xuất kho — kho Thomas) | Không có giao diện hủy. **Gửi lại có số version để ghi đè**; `中止` (dừng giao) = **gửi lại với số lượng 0**. ES giữ nội dung lần gửi cuối, lệch với dữ liệu giao hàng thì đẩy “cần gửi lại: N件 (N đơn)” lên `要確認` (cần kiểm tra). **Chỉ gửi lại được trước khi kho bắt đầu pick hàng** |
| `送り状番号` (số vận đơn) | ES **không tự cấp số**; nhận từ hãng vận chuyển rồi lưu. **Ngoại lệ (2026-09-29):** chuyến đối tác đến kho lấy hàng (không có vận đơn của hãng) → ES tự đánh số `issued_by = es_generated`, số = delivery No + số thùng 2 chữ số (VD `DL-261020-0021-01`), tạo theo số thùng dự kiến khi gửi `出荷指示` thành công; kết quả xuất kho khác số thùng thì thêm phần thiếu / phần thừa → `voided`; không có link tra cứu 〔決定v2.3 #47〕. 1 đơn giao hàng có **nhiều** vận đơn; `一部未受取` (nhận thiếu một phần) / `一部納品` (giao một phần) xét **theo từng vận đơn** |


**Dữ liệu bổ sung 2026-09-29 (chuẩn là DEV spec §14)** 〔決定v2.3 #39〜#41 / #47 / #49〕:

- `delivery_lines`: thêm `substituted_from_product_id NULL` (sản phẩm gốc của dòng hàng thay thế); `disposed_qty` (số hủy).
- `deliveries`: **`freight_billable`** (giao lại và `中止`; cũ: `redelivery_billable`, đổi tên 2026-09-29); thêm `return_to_warehouse_id NULL`; `duplicate_type` thêm `return`.
- `warehouses.warehouse_type`: thêm `return` (điểm gửi trả).
- `delivery_tracking_numbers`: `issued_by` thêm `es_generated`; thêm `box_no` / `box_total`.
- `delivery_legs`: thêm `picked_up_at NULL` / `picked_up_by NULL`.

---

## 8. Cơ chế phát hiện bất thường

`自社便` (chuyến tự vận hành) có báo cáo trong ngày từ app tài xế. Nhưng **`委託便` (chuyến ủy thác cho hãng vận chuyển)** tự động thành `納品済（みなし）` (coi như đã giao đủ) bởi batch **06:00 ngày hôm sau** (chỉ đơn `出荷済` **không có trouble chưa resolve**, §3A) → cách duy nhất để phát hiện bất thường là:

- **`欠配検知バッチ` (batch phát hiện không giao — 06:00 hằng ngày, REQ-DL-663):** tìm đơn **đã qua ngày giao mà không phải `納品済` (đã giao đủ) / `中止` (dừng giao) / `取消` (đã hủy)** → đẩy lên **`要確認` (cần kiểm tra)**. **Bắt buộc phải có.** Đơn có trouble chưa resolve **không** vào batch này (đã nằm ở `要確認` qua báo cáo sự cố); auto-child tạo ngay khi báo cáo nên không còn batch nào phải chạy trước（Cũ: `trouble_auto_duplicate` chạy trước batch này — bỏ 2026-09-29, DEV §16.8.1 / §16.13）.

Tất cả bất thường từ app — **`一部未受取`** (nhận thiếu một phần), **`一部納品`** (giao một phần), chênh lệch số lượng khi kiểm hàng, **`トラブル報告`** (báo cáo sự cố), chưa phân công tài xế (`assignment_missing` — xem dưới), **`欠配`** (không giao được) — đều **gom về mục `要確認` (cần kiểm tra) của màn hình `運営スケジュール` (lịch vận hành)**, để vận hành không phải mở màn hình tài xế mới thấy.

- **Chưa phân công tài xế (`assignment_missing`)** 〔決定v2.3 #43 / #48〕: leg cần assign là leg có `delivery_regime` = `self` / `partner_driver` (leg `parcel_carrier` = hãng vận chuyển không assign) — **không phân biệt chặng 1 / chặng 2**. Tới **ngày trước ngày giao** mà leg đó vẫn chưa có tài xế → `要確認` `assignment_missing`. Trước đó xem badge 「未割当 N件」 (chưa assign N đơn) trên lịch tháng / tuần. Không chặn xuất kho.（Cũ: chưa assign tại thời điểm lock / còn dưới 1 tuần trước ngày giao; chỉ assign chặng 2. Bỏ 2026-09-29）
- **Trung chuyển** 〔決定v2.3 #49〕: không thêm trạng thái trung gian. Mỗi lần 「荷物受取」 (nhận hàng) ghi `delivery_legs.picked_up_at` / `picked_up_by`; leg cuối chưa nhận hàng tới sáng hôm sau ngày giao → `delivery_detect_missing` bắt như trên.

---

## 9. Sơ đồ trạng thái tổng thể

```
【Bản ghi gốc — parent】   ※ parent KHÔNG bao giờ vào 確認中 vì sự cố (2026-09-24)

(納品予定 = lịch dự kiến: không có trạng thái)
        │ 確定生成 (sinh chính thức)
        ▼
    出荷待 ──→ 出荷済 ──→ 受取済 ──→ 納品済
  (chờ xuất   (đã xuất   (tài xế đã  (đã giao đủ)
    kho)        kho)      nhận hàng)
      │           │
      │           └→ 納品済（みなし） = coi như đã giao đủ
      │                [final leg hãng vận chuyển, batch 06:00, chỉ khi không có trouble chưa resolve]
      │
      └→ 取消 (hủy, chỉ trước khi xuất kho · lý do bắt buộc)
              └→ [複製 (nhân bản): 代替便 = chuyến thay thế]

  トラブル報告 (báo cáo sự cố) / 数量差異 (chênh lệch SL) / 納品後の連絡 (khiếu nại sau giao):
    出荷済 / 受取済 / 納品済 ──(giữ nguyên trạng thái)──→ mở trouble + 要確認 trouble_open (đối tượng = delivery)
        └ loại 誤配送 / 不在・受け取り不可 / 破損・品質不良 (auto_child = true)
            → cùng transaction tạo 自動子 (bản con tự động) — tối đa 1 bản còn sống / delivery
        └ loại 数量相違 / 遅延 / その他 / chưa xác định → không tạo bản con
            (chưa xác định → vận hành phân loại sang loại auto_child = true thì tạo lúc đó)

  運営（物流）(vận hành logistics) resolve parent trực tiếp — theo delivery, đóng mọi báo cáo chưa resolve:
    出荷済 / 受取済 / 納品済 ──→ 納品済    (giao đủ — kể cả hàng thay thế)    auto-child → 取消
    出荷済 / 受取済 ──────────┬→ 一部納品済 (đã giao một phần) + bản con: số còn lại  (reuse auto-child nếu có)
                             ├→ 一部納品済 (partial_no_resend: không giao phần còn lại,
                             │              không có bản con, lý do bắt buộc)         auto-child → 取消
                             ├→ 再配達待  (chờ giao lại)     + bản con: toàn bộ SL  (reuse auto-child nếu có)
                             ├→ 受取済    (quay lại giao trong ngày)             auto-child → 取消
                             └→ 中止      (dừng giao — thực tế 0, lý do bắt buộc)  auto-child → 取消
    納品済（みなし, completion_source = presumed） — Yamato xác nhận hàng không tới:
                             ┬→ 再配達待  (chờ giao lại) + bản con: toàn bộ SL  (reuse auto-child nếu có)
                             └→ 中止      (dừng giao — không tính tiền)            auto-child → 取消
                             ※ chưa quyết: chỉ một phần thùng không tới → 一部納品済 ?
    受取済 (chỉ có trouble 遅延 chưa resolve) ──(tài xế báo giao đủ)──→ 納品済
                             (hệ thống tự resolve báo cáo 遅延 = giao đủ, actor_type = system)

  出荷済 / 受取済 ──→ 中止 (không giao được nữa sau khi đã xuất kho / đã nhận — lý do bắt buộc)


【Bản con — child (DL-…-1)】   ※ 確認中 trong luồng sự cố chỉ dùng ở đây (shipped_date IS NULL)

  複製 (nhân bản do vận hành: remainder / redelivery) ──────────────┐
  自動子 (bản con tự động: tạo ngay khi báo cáo, loại auto_child,    ├→ 確認中 (đang xác minh)
          creation_source = trouble_auto, trouble_pending) ─────────┘        │
                                                                             ├→ 出荷待 (chờ xuất kho — đã chốt ngày + SL;
                                                                             │          auto-child cần schedule_confirmed = true
                                                                             │          và quantity_confirmed = true)
                                                                             │     └→ đi tiếp luồng bình thường như parent
                                                                             └→ 取消 (hủy — không cần giao lại, lý do bắt buộc)

  Sự cố ở bản con DL-…-1 → bản mới là nhánh tiếp theo của parent gốc (DL-…-2), copy nội dung từ DL-…-1
```

**Đối chiếu badge app tài xế V1.0 ↔ trạng thái phía vận hành** (chữ trong app **không đổi**):

| Badge trên app tài xế | Nghĩa | Trạng thái phía vận hành |
|---|---|---|
| `未受取` | Chưa nhận hàng | `出荷済` (đã xuất kho) |
| `未配送` | Chưa giao | `受取済` (tài xế đã nhận hàng) |
| `配送完了` | Đã giao xong | `納品済` (đã giao đủ) |
| `トラブル` | Sự cố | Trạng thái **giữ nguyên** (`出荷済` / `受取済`) + có `トラブル報告` (báo cáo sự cố) chưa resolve（Cũ: `確認中`. 2026/09/24 bỏ〔決定v2.3 #20〕） |

---

## 10. Phân quyền (`権限` = quyền)

| Người dùng | Xem | Đăng ký | Sửa | Xóa / hủy | Duyệt |
|---|---|---|---|---|---|
| Vận hành (`物流` logistics / CS) | ○ | ○ | ○ (ngày giao, lịch) | ○ | ○ |
| Hãng vận chuyển ủy thác | ○ (phần của mình — **chỉ delivery có leg do công ty mình phụ trách**, 2026-09-29 〔決定v2.3 #51〕) | ○ (báo giá, chat) | △ (phân công tài xế — chỉ leg của mình: chặng 1 tới lúc nhận tại kho, chặng 2 từ lúc nhận ở điểm trung chuyển tới giao) | × | × |
| Tài xế | ○ (đơn trong ngày) | ○ (nhận hàng, giao, hủy hàng, kiểm kê, giờ) | △ (báo cáo) | × | × |
| Kho | ○ | ○ (hoàn tất pick hàng) | △ | × | × |

---

## 11. Lưu ý khi đọc tài liệu

- **`ÉS/01_仕様/10_配送/画面設計書_トラブル報告_V1.0.md` (tài liệu thiết kế màn hình “báo cáo sự cố”) là tài liệu KHÁC.** Đó là màn hình app Flutter để khách hàng **báo hỏng thiết bị** (nước, thoát nước, điều hòa…) cho nhà thầu — **không liên quan tới sự cố giao hàng** trong tài liệu này. Đừng dùng lẫn.
- Các yêu cầu liên quan mà **trạng thái còn là `提案` (mới là đề xuất)**, chưa `決定済み` (chưa chốt): REQ-DL-657 (master 6 loại + đăng ký thay), REQ-DL-660〜663. Cần chốt với vận hành trước khi implement.
- Điểm **chưa chốt** (2026-09-29, 〔決定v2.3 #27〕): với `納品済（みなし）` (coi như đã giao), nếu **chỉ một phần thùng không tới** thì có cho chuyển sang `一部納品済` (đã giao một phần) hay không.
- REQ-DL-650 (báo cáo sự cố → vận hành resolve parent) **đã chốt** ngày 2026-09-24 (`決定済み`): parent giữ nguyên trạng thái, vận hành resolve trực tiếp (§3.1).
- ~~Điểm **chưa chốt**: **thời hạn tiếp nhận liên hệ sau khi đã `納品済` (đã giao đủ)** — bao nhiêu ngày thì còn cho chuyển về `確認中` (đang xác minh).~~ → **Không còn áp dụng (2026-09-24):** khiếu nại sau giao **không đưa `納品済` về `確認中` nữa** — parent giữ `納品済`, chỉ mở trouble + `要確認` (cần kiểm tra) 〔決定v2.3 #20〕, REQ-DL-856 / REQ-DL-906.

---

## Phụ lục: bảng tra yêu cầu (`要件ID` = mã yêu cầu)

| ID | Nội dung |
|---|---|
| REQ-DL-313 | Đổi tên trạng thái `トラブル` (sự cố) → `確認中` (đang xác minh); có chức năng comment của vận hành cho khách xem. **Từ 2026-09-24: báo cáo sự cố / khiếu nại sau giao không đưa parent về `確認中`**. Từ 2026-09-29 web khách hàng dùng nhãn hiển thị riêng (DEV §12.4) — `取消` có chuyến thay thế = 「配送日調整中」（cũ: hiển thị 「確認中」, 2026-09-29）〔決定v2.3 #42〕 |
| REQ-DL-316 | Phiếu giao hàng xuất được khi `出荷待` (chờ xuất kho) / `出荷済` (đã xuất kho); phản ánh thông tin `代替品` (hàng thay thế) — từ 2026-09-29 lấy từ `delivery_lines.substituted_from_product_id`, giá theo sản phẩm gốc 〔決定v2.3 #39〕 |
| REQ-DL-649 | Phần chưa giao của thao tác “hoàn tất khi còn hàng chưa giao” tạo thành bản con có số nhánh; bản gốc = `一部納品済` (đã giao một phần) |
| REQ-DL-649-2 | Bản con của `分納` (giao bù) / `再配達` (giao lại) tạo ở `確認中` (đang xác minh) + ngày tạm, lên `要確認` (cần kiểm tra), **không vào đối tượng chỉ thị xuất kho** cho tới khi vận hành chốt. Đã có `自動子` (bản con tự động) thì dùng lại, không tạo bản thứ hai |
| REQ-DL-650 | Nhận báo cáo sự cố → **parent giữ nguyên trạng thái**, mở trouble + `要確認`; `運営（物流）` (vận hành logistics) resolve trực tiếp: `納品済` / `一部納品済` (kể cả `partial_no_resend`) / `再配達待` / `受取済` (quay lại trong ngày) / `中止`, kèm lý do; resolve theo delivery (REQ-DL-918)（Cũ: → `確認中` rồi chọn hướng xử lý. 2026/09/24 bỏ） |
| REQ-DL-657 | Master 6 loại sự cố + hướng xử lý mặc định + `代理登録` (đăng ký thay) bởi vận hành |
| REQ-DL-660 | Chốt tiền theo tháng dương lịch của ngày giao; cước giao lại **và cước khi `中止`** chọn từng ca bằng `freight_billable` (mặc định false, true thì bắt buộc lý do); `中止` (dừng giao) không tính tiền hàng, không chuyển kỳ（cũ: “phí giao lại chọn từng ca” với `redelivery_billable`, 2026-09-29）〔決定v2.3 #40〕 |
| REQ-DL-661 | ES không cấp `送り状番号` (số vận đơn) — trừ chuyến đối tác đến kho lấy hàng: `issued_by = es_generated` (2026-09-29 〔決定v2.3 #47〕); 1 đơn giữ nhiều vận đơn; xét `一部未受取` (nhận thiếu một phần) / `一部納品` (giao một phần) theo từng vận đơn |
| REQ-DL-662 | `出荷指示` (chỉ thị xuất kho) không có hủy — gửi lại kèm version để ghi đè; `中止` (dừng giao) = gửi số lượng 0; phát hiện lệch → `要確認` (cần kiểm tra) |
| REQ-DL-663 | Batch phát hiện `欠配` (không giao được) hằng ngày; loại đơn có trouble chưa resolve; bắt cả leg cuối chưa nhận hàng khi có trung chuyển (2026-09-29 〔決定v2.3 #49〕) |
| REQ-DL-678 | Nhân bản xuất từ kho khác ⇒ coi là `代替品` (hàng thay thế); kho không có hàng thì chọn lại sản phẩm |
| REQ-DL-934 / 935 / 937 / 943 / 944 / 945 (詳細要件仕様 §8R) | 2026-09-29: duplicate `return` (`返送` = gửi trả, không tính tiền, `return_to_warehouse_id`) 〔#41〕; `assignment_missing` = ngày trước ngày giao, leg cần assign theo `delivery_regime` 〔#43 / #48〕; `delivery_legs.picked_up_at` / `picked_up_by`, `受取済` chỉ ở lần nhận đầu tiên 〔#49〕 |
| REQ-DL-751〜756 | Hệ thống trạng thái 3 trục, danh sách giá trị, chặn transition ngoài bảng |
| REQ-DL-801 | Bản nhân bản đang `確認中` (đang xác minh) nằm ngoài đối tượng `出荷指示` (chỉ thị xuất kho) |
| REQ-DL-856 | Khiếu nại sau giao: `納品済` (đã giao đủ) giữ nguyên, không về `確認中`; hóa đơn đã chốt thì điều chỉnh tháng sau |
| REQ-DL-869 / 870 | `みなし` (coi như đã giao) / missing queue theo final leg; loại đơn có trouble chưa resolve |
| REQ-DL-900 | `review_items` (`要確認` = cần kiểm tra) — thêm kind `trouble_auto_child_pending`; từ 2026-09-29 thêm `trouble_open` (REQ-DL-923) |
| REQ-DL-905 | 5 trạng thái cuối; `確認中` chỉ dùng cho bản con / recovery candidate, đi ra `出荷待` / `取消` |
| REQ-DL-906 | Báo cáo sự cố / chênh lệch số lượng / khiếu nại sau giao **không đổi trạng thái parent** |
| REQ-DL-907 | `運営（物流）` (vận hành logistics) resolve parent trực tiếp (bảng §3.1), cùng transaction với auto-child |
| REQ-DL-908 | **1 delivery phát sinh sự cố = tối đa 1 auto-child còn sống** (theo `source_trouble_delivery_id`); reuse cho `分納` / `再配達`; `DOMAIN_TROUBLE_CHILD_EXISTS`（Cũ: 1 báo cáo = 1 bản con. Đổi 2026-09-29〔決定v2.3 #29〕） |
| ~~REQ-DL-909~~ | ~~Batch `trouble_auto_duplicate`: hạn `auto_duplicate_due_at`, điều kiện tạo, thuộc tính auto-child~~ → **Bỏ 2026-09-29**, thay bằng REQ-DL-915 / REQ-DL-916 〔決定v2.3 #30〕 |
| REQ-DL-910 | Auto-child: phạm vi copy (từ delivery phát sinh sự cố), ngày / số lượng tạm, `creation_source=trouble_auto`, unique theo `source_trouble_delivery_id`, `要確認` `trouble_auto_child_pending`（Cũ: UPSERT theo `source_trouble_report_id`. Đổi 2026-09-29） |
| REQ-DL-911 | Auto-child chưa xác nhận bị loại khỏi xuất kho / vận đơn / phân công / tính tiền / thông báo / `みなし` |
| REQ-DL-912 | `確認中 → 出荷待` cần 2 cờ confirmed = true (`DOMAIN_TROUBLE_CHILD_UNCONFIRMED`); không cần giao lại → `取消` cùng transaction |
| ~~REQ-DL-913~~ | ~~Thứ tự batch~~ → **Bỏ 2026-09-29** (không còn batch `trouble_auto_duplicate`). Điều kiện `みなし` / phát hiện `欠配` chỉ lấy đơn không có trouble chưa resolve vẫn giữ (REQ-DL-869 / 870) |
| REQ-DL-914 | Data model: cột `deliveries`, review kind, mã lỗi（`trouble_reports.auto_duplicate_due_at` bỏ 2026-09-29 — xem REQ-DL-925） |
| REQ-DL-915 / REQ-DL-916 | Auto-child tạo ngay trong transaction đăng ký báo cáo, chỉ với loại `auto_child = true` (`wrong_delivery` / `absent` / `damage`); không SLA, không batch 〔決定v2.3 #30〕 |
| REQ-DL-915 / REQ-DL-923 | Loại chưa xác định (「商品不足・誤配送」, `type_code = NULL`) không tạo; vận hành phân loại sang loại `auto_child = true` thì tạo lúc đó; báo cáo chưa resolve lên `要確認` `trouble_open` 〔決定v2.3 #30〕 |
| REQ-DL-917 / REQ-DL-918 | Resolve theo đơn vị delivery (đóng mọi báo cáo chưa resolve cùng lúc); tối đa 1 auto-child còn sống / delivery: `UNIQUE(source_trouble_delivery_id) WHERE creation_source = 'trouble_auto' AND status <> '取消'` 〔決定v2.3 #29〕 |
| REQ-DL-919 | Sự cố ở bản con → nhánh tiếp theo của parent gốc, copy nội dung từ bản con bị sự cố; vượt 9 → `DOMAIN_BRANCH_LIMIT` + `要確認` 〔決定v2.3 #28〕 |
| REQ-DL-920 | `納品済` với `completion_source = presumed`: Yamato xác nhận không tới → vận hành resolve `再配達待` (có bản con) / `中止`; không tính tiền, hóa đơn đã chốt → điều chỉnh tháng sau; không áp dụng `reported` / `customer`. Chưa quyết: một phần thùng không tới 〔決定v2.3 #27〕 |
| REQ-DL-921 | Resolution `partial_no_resend`: parent `一部納品済`, không bản con, auto-child → `取消`, không ngưỡng, lý do bắt buộc, phần thiếu không tính tiền 〔決定v2.3 #31〕 |
| REQ-DL-922 | Delivery chỉ có báo cáo `delay` chưa resolve + tài xế báo giao đủ → hệ thống tự resolve = giao đủ (`actor_type=system`) 〔決定v2.3 #32〕 |
| REQ-DL-924 / REQ-DL-925 / REQ-DL-926 | Data model: `trouble_types` (`auto_child`…), `trouble_app_reasons`, `trouble_reports.type_code` NULL / `resolution` + `partial_no_resend` / bỏ `auto_duplicate_due_at`, `deliveries.source_trouble_delivery_id` / `creation_source=trouble_auto`, `review_items.kind=trouble_open`, bỏ cấu hình `trouble_auto_duplicate_after_minutes` 〔決定v2.3 #33〕 |
