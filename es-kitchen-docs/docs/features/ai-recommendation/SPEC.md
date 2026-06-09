# SPEC: AI Recommendation & Optimization Engine

> **Loại:** Cross-repo (API + Company Admin Web + Mobile App)
> **Repos liên quan:** `es-kitchen-api` · `es-kitchen-web-company` (E02) · `es-kitchen-payment-app` (E01) · external AI service
> **Actor chính:** Company Admin (E02) — chọn mode, xem recommendation; End User (E01) — Mode 4 trả lời khảo sát
> **Ngày:** 2026-06-02
> **Status:** Draft — overview kỹ thuật đã có tại `overview.md`, SPEC này tập trung góc nhìn nghiệp vụ
> **Source:** `es-kitchen-requirements/req_ai_system/req_ai_system.pdf` + `eskitchen_ai_system.png` + `flow_jp_AI_SYSTEM.png` + existing `overview.md` cùng folder
> **Phase 1 (October release):** Mode 1, 2, 4, 5, 6 in scope · Mode 3 deferred

---

## 1. Mô tả nghiệp vụ

Hỗ trợ **法人顧客 (Corporate customer / doanh nghiệp)** đặt số lượng món ăn tháng tới một cách **tối ưu** — giảm waste, tăng utilization, đúng ràng buộc plan tháng.

Hệ thống cung cấp **6 mode** generate recommendation số lượng món:

| Mode | Tên | Phương pháp |
|---|---|---|
| 1 | Equal split (均等割) | Chia đều theo plan total |
| 2 | Company historical AI (企業別過去実績AI) | ML (LightGBM/XGBoost) học từ history doanh nghiệp |
| 3 | Industry average AI (他社平均AI) | **Deferred Phase 2** |
| 4 | Employee preference AI (従業員希望AI) | Tổng hợp khảo sát từ E01 mobile app |
| 5 | Manual input (手動登録) | Admin nhập tay |
| 6 | Chat AI (AIにチャット) | ChatGPT + Mode 2 reuse với custom condition |

Mode 2 là core AI engine, sử dụng **MILP solver (OR-Tools)** cho bước tối ưu cuối.

> **Chi tiết kỹ thuật:** xem `overview.md` cùng folder — kiến trúc 5 layer, Cold start strategy, Retraining strategy, 3 case phân nhánh của Mode 2.

---

## 2. Actors & Preconditions

| Actor | Vai trò | Precondition |
|---|---|---|
| Company Admin (E02) | Vào màn đặt order tháng → chọn 1 trong 6 mode → xem recommendation → confirm | Đã login, doanh nghiệp đã có contract + plan tháng |
| End User (E01) Mobile | Trả lời khảo sát preference (cho Mode 4) | Đã login app E01, thuộc doanh nghiệp có plan |
| System Admin (E03) | Cấu hình constraints chung (category ratio, price tier ratio) | Có quyền "AI Config" |
| Team AI (external) | Build & deploy model, expose API ingest + serve prediction | Bên ngoài scope dev ESKITCHEN |

---

## 3. Happy Path — Mode 2 (Company Historical AI)

1. Company Admin vào **Order Management → Create Order (tháng N+1)**
2. Chọn **Branch + Plan** (50/100/150 phần)
3. Chọn **Order Method = "AI Recommendation — Company History"** (Mode 2)
4. *(Optional)* Upload CSV menu tháng mới (hoặc dùng menu sync)
5. Hệ thống:
   - Lấy plan tháng + new menu list từ API connect
   - Gọi AI service → predict score per item → chọn top-K
   - Predict quantity per item
   - Chạy MILP optimization với constraints (plan total, max per item, category ratio, price ratio)
   - Trả về recommended quantity list
6. Admin xem bảng recommended order:

| Product ID | Tên món | Category | Unit price | Recommended qty |
|---|---|---|---|---|

7. Admin có thể chỉnh số lượng từng item → submit final order

## 4. Happy Path — Mode 1 (Equal Split)

1. Như Mode 2 nhưng chọn **"Equal split"**
2. Hệ thống chia đều `plan_total / num_items` cho mỗi item của menu mới
3. Hiển thị bảng tương tự → Admin chỉnh → submit

## 5. Happy Path — Mode 4 (Employee Preference)

### 5a. End User (E01) trả lời khảo sát preference
1. Hệ thống định kỳ (hoặc trigger by Admin) gửi survey "Bạn muốn ăn gì tháng tới?" cho user E01 thuộc doanh nghiệp
2. User chọn món yêu thích / ưu tiên trong app
3. Lưu vào bảng preference

### 5b. Admin chọn Mode 4
1. Hệ thống aggregate preference → tính score theo số lượng vote
2. Áp lên menu tháng mới → tính category ratio → optimize MILP
3. Output: recommended list

## 6. Happy Path — Mode 5 (Manual)

1. Admin chọn Mode 5
2. Hệ thống hiển thị bảng tất cả menu items, qty = 0
3. Admin nhập tay từng số lượng → tự validate (sum = plan, max per item, category ratio)
4. Submit

## 7. Happy Path — Mode 6 (Chat AI)

1. Admin chọn Mode 6 + nhập condition tự nhiên:
   - "không muốn ăn cá"
   - "tăng món thịt"
   - "giảm giá xuống"
2. ChatGPT extract intent → mapping vào pre-defined constraint dictionary
3. Inject constraint vào pipeline Mode 2 → optimize lại
4. Output: recommended list với constraint mới
5. Admin xem → confirm hoặc nhập condition khác để refine

---

## 8. Alternative Flows & Edge Cases

| Tình huống | Xử lý |
|---|---|
| Doanh nghiệp mới chưa có history → Mode 2 | Cold start: dùng score trung bình toàn hệ thống cho item đó (Phase 1) hoặc Mode 3 (deferred Phase 2) |
| Item mới hoàn toàn (chưa có history + chưa có category history) | Case 3: dùng admin-config ratio mặc định |
| Tất cả menu item mới (vd setup ban đầu) | Mode 2 fallback về Equal split? *(OQ-1)* |
| Mode 6 chat — ChatGPT API fail | *(OQ-2)* Fallback về Mode 2 không có custom condition? Báo lỗi? |
| Retraining cronjob fail | *(OQ-3)* Alert? Skip retrain tháng đó, dùng model cũ? |
| API ingest data từ team AI fail | Đẩy retry, lưu queue, alert |
| Constraints conflict (vd category ratio + price ratio không thể đồng thời thoả) | MILP báo infeasible — *(OQ-4)* relax constraint nào trước? |
| Mode 4 — không có user trả lời survey | *(OQ-5)* Fallback Mode 1 hay không cho phép Mode 4? |
| Plan thay đổi giữa chừng (ví dụ 100 → 120) | Recommend lại với plan mới |
| Admin chỉnh số lượng vượt constraint | Inline validate báo lỗi |
| Mode 6 intent không mapping được | *(OQ-6)* Hỏi lại user clarify, hay bỏ qua, hay báo lỗi? |

---

## 9. Acceptance Criteria

| # | Criteria |
|---|---|
| AC-01 | Company Admin có thể chọn 1 trong 5 mode (1, 2, 4, 5, 6) ở màn order tháng |
| AC-02 | Mode 1 (Equal split): hệ thống chia đều plan_total cho menu items mới |
| AC-03 | Mode 2: hệ thống predict score + quantity + chạy MILP optimization, output recommended list đúng plan total |
| AC-04 | Mode 4: hệ thống aggregate preference từ E01 → đưa vào pipeline Mode 2 |
| AC-05 | Mode 5: hệ thống hiển thị bảng input để Admin nhập tay, validate constraint inline |
| AC-06 | Mode 6: ChatGPT extract intent → inject constraint → re-run Mode 2 |
| AC-07 | Recommended quantity tuân thủ tất cả constraints: plan total, max per item, category ratio, price tier ratio |
| AC-08 | Admin có thể chỉnh số lượng từng item trước khi submit, có inline validation |
| AC-09 | Cold start: item mới + doanh nghiệp cũ → score trung bình category cùng doanh nghiệp |
| AC-10 | Cold start: doanh nghiệp mới + item cũ → score trung bình toàn hệ thống |
| AC-11 | Retraining hằng tháng qua cronjob — log success/fail |
| AC-12 | API ingest data tháng vào bảng AI chuyên dụng — không lẫn với production tables |
| AC-13 | Output format đúng spec JSON: `{ items: [{product_id, quantity, category, unit_price}] }` |
| AC-14 | Mode 4 yêu cầu khảo sát E01 — survey phải có cơ chế trả lời trong app |

---

## 10. Open Questions — Cần confirm

| # | Câu hỏi | Tầm quan trọng | Cần ai chốt |
|---|---|---|---|
| OQ-1 | Tất cả menu item mới — Mode 2 fallback về Mode 1 hay báo lỗi? | 🟡 High | PM + Team AI |
| OQ-2 | Mode 6 — ChatGPT fail: fallback Mode 2 không có custom condition? Báo error? | 🟡 High | BA + Team AI |
| OQ-3 | Retraining fail: alert ai? Skip retrain, dùng model cũ? | 🟡 High | DevOps + Team AI |
| OQ-4 | Constraints conflict (MILP infeasible) — priority order để relax? | 🔴 Critical | BA + Team AI |
| OQ-5 | Mode 4 không có user trả lời survey → fallback hay block? | 🟡 High | BA |
| OQ-6 | Mode 6 intent không mapping được — clarify, skip, hay error? | 🟠 Medium | BA |
| OQ-7 | Threshold waste rate để loại item khỏi recommendation | 🟡 High | BA |
| OQ-8 | Top-K của Case 1 — K = ? (số item top score được chọn) | 🟡 High | Team AI |
| OQ-9 | Định nghĩa "tăng món thịt +10%" — cụ thể bao nhiêu %? Lookup table intent → ratio | 🟡 High | BA + Team AI |
| OQ-10 | Combine user custom condition + ES required condition — strategy override hay merge? | 🔴 Critical | PM + Khách hàng |
| OQ-11 | Mode 6 — có giữ history conversation để user refine không? Hay mỗi lần start mới? | 🟠 Medium | BA |
| OQ-12 | Mode 4 survey — tần suất gửi cho user E01 (1 lần/tháng?), trigger by Admin hay tự động? | 🟡 High | BA |
| OQ-13 | API contract giữa es-kitchen-api ↔ AI service — REST endpoints, auth method, timeout, retry | 🔴 Critical | Team AI |
| OQ-14 | Performance SLA: thời gian response tối đa cho 1 recommendation request? | 🟡 High | PM + Team AI |
| OQ-15 | Logging: lưu input + output mỗi lần recommend để audit / training? Privacy? | 🟡 High | BA + Compliance |
| OQ-16 | UI hiển thị "lý do recommend" (explainability) — có cần không? | 🟠 Medium | BA |

---

## 11. Out of Scope

- **Mode 3 (Industry Average AI)** — defer Phase 2
- Real-time recommendation (chỉ batch per order tháng)
- Auto-submit order không cần Admin review
- AI-generated menu items (chỉ recommend số lượng cho menu có sẵn)
- Multi-currency optimization
- Cross-doanh nghiệp recommendation
- AI dashboard chi tiết (chỉ output recommendation, không analytics riêng)
- Audio / voice input cho Mode 6 (chỉ text chat)
- Mobile UI để Company Admin chọn mode (chỉ web E02)

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| CW_AIREC_001 | Order Creation — Select Order Method | Company Admin | E02 (es-kitchen-web-company) | Form | Chọn Branch + Plan, chọn 1 trong 5 mode recommendation (Mode 1/2/4/5/6) khi tạo order tháng N+1 |
| CW_AIREC_002 | AI Recommendation Result | Company Admin | E02 (es-kitchen-web-company) | Detail | Xem bảng recommended order (Product ID, tên món, category, unit price, recommended qty), chỉnh số lượng từng item, submit final order |
| CW_AIREC_003 | Mode 5 Manual Input | Company Admin | E02 (es-kitchen-web-company) | Form | Nhập tay số lượng từng menu item, inline validation (sum = plan total, max per item, category ratio) |
| CW_AIREC_004 | Mode 6 Chat AI — Nhập Condition | Company Admin | E02 (es-kitchen-web-company) | Chat | Nhập condition tự nhiên (ví dụ "không muốn ăn cá"), xem recommended list sau khi AI inject constraint, refine tiếp nếu cần |
| UA_AIREC_001 | Employee Preference Survey | End User | E01 (es-kitchen-payment-app) | Form | Trả lời khảo sát "Bạn muốn ăn gì tháng tới?", chọn món yêu thích / ưu tiên cho Mode 4 |
| AW_AIREC_001 | AI Config — Constraints Setup * inferred | System Admin | E03 (es-kitchen-web-admin) | Settings | Cấu hình constraints chung cho AI: category ratio, price tier ratio áp dụng toàn hệ thống |

---

## 12. Phần kỹ thuật chi tiết

Xem `overview.md` cùng folder cho:
- Kiến trúc 5 layer (Data, AI Prediction, Constraint, Optimization, Output)
- 3 case phân nhánh Mode 2 (Case 1/2/3)
- Cold start strategy chi tiết
- Retraining strategy + bảng AI chuyên dụng
- Constraint formula
- Blast radius cross-repo
- Reference Figjam business flow

---

## Bước tiếp theo

→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/ai-recommendation/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/ai-recommendation/SPEC.md)
