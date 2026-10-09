# [FE] [Delivery_Web] — スケジュール tuần: danh sách điểm giao trong từng cột ngày

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — スケジュール
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 6h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend | 
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | task-3-8 |
| Song song với | task-3-10 |
| Estimate | ~6h |

## Mục tiêu
Điền danh sách điểm giao vào từng cột ngày: mỗi dòng có icon 温度帯 + tên điểm giao, bấm vào mở 配送詳細.

## Context (đọc trước khi code)
- **Figma:** node **`31498:191010`** — mỗi dòng 1 điểm giao, tên dài bị cắt 1 dòng
- **Design-Technical.md (FE)** → FE-02
- `src/pages/schedule/components/WeeklyListTab.tsx` (task-3-8)
- `src/constants/route.ts` — route `DELIVERY_STATUS` + `/:id`

## API Definition
Dùng `items[]` trong response của task-2-3 (không thêm API).

## Yêu cầu implement

### Step 3 — `WeeklyListTab.tsx` + `WeeklyDayItem.tsx`
- Mỗi dòng: icon theo `cargoType` (冷凍 / 冷蔵・常温 / 資材) + `destinationName`
- Tên dài → `truncate` 1 dòng + `title` tooltip đầy đủ
- Bấm dòng → `navigate('/delivery-status/<deliveryBlockId>')`
- Cột không có điểm giao → vùng trống (không hiện chữ "không có dữ liệu" nếu Figma không vẽ)
- Cột nhiều điểm giao → scroll dọc trong cột, không đẩy chiều cao hàng

## Unit Tests (BẮT BUỘC)
```typescript
it('renders one row per delivery item with the right cargo icon', ...);
it('truncates a long destination name and keeps it in the title attribute', ...);
it('navigates to the delivery detail on row click', ...);
it('renders an empty column without crashing', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage Weekly`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Dữ liệu thật: số dòng khớp `totalCount` của ngày đó
- [ ] Bấm 1 dòng mở đúng 配送詳細 tương ứng
- [ ] Ngày nhiều đơn (>15) không làm vỡ layout

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Khung tuần (task-3-8) | `WeeklyListTab.tsx` | Test suite task-3-8 pass |
| Màn 配送詳細 | `DeliveryStatusDetailPage.tsx` | Mở từ lịch tuần hoạt động như mở từ danh sách |

## Không được làm
- Không gọi thêm API cho mỗi dòng
- Không hiển thị thêm field ngoài 4 field BE trả

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
