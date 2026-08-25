# Hợp Đồng (Contract)

Dữ liệu hợp đồng là **trung tâm** liên kết khách hàng ↔ plan ↔ điều khoản giao hàng. Được scrape từ `/CustomerPlan/SearchAll/` trên ES Station.

## Files

| File | Records | Download |
|---|---|---|
| `scraped_customer_plans` | 2.052 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_customer_plans.json) |
| `scraped_plans` | 41 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_plans.json) |
| `scraped_trial_plans` | 30 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_trial_plans.json) |

---

## scraped_customer_plans — 2.052 records

Master hợp đồng đang hoạt động. 3 tháng × ~700 records/tháng.

| Field | Type | Mô tả |
|---|---|---|
| `contract_plan_id` | `string` | **Khóa chính** `CP#####` |
| `customer_id` | `string` | ID công ty `CU#####` |
| `plan_id` | `string` | ID loại plan `ES700` |
| `plan_name` | `string` | `700プラン` |
| `customer_plan_name` | `string` | Tên hợp đồng tùy chỉnh |
| `menu_type` | `string` | `通常` / `惣菜のみ` |
| `customer_name` | `string` | Tên công ty |
| `customer_name_kana` | `string` | Tên katakana |
| `price` | `int` | Phí tháng (JPY) |
| `service_rate` | `float` | Tỉ lệ tặng kèm (%) |
| `all_food_count` | `int` | Tổng số suất/tháng |
| `postal_code` | `string` | Mã bưu chính |
| `prefecture` | `string` | Tỉnh |
| `city` | `string` | Thành phố/quận |
| `address` | `string` | Địa chỉ |
| `full_address` | `string` | Địa chỉ đầy đủ |
| `section` | `string` | Phòng ban |
| `tel` | `string` | *(anonymized: `000-0000-0000`)* |
| `fax` | `string\|null` | *(anonymized)* |
| `start_date` | `YYYY-MM-DD` | Ngày bắt đầu hợp đồng |
| `end_date` | `YYYY-MM-DD` | Ngày kết thúc hợp đồng |
| `delivery_count` | `int` | Số đợt giao/tháng (1/2/4/8) |
| `delivery_kbn` | `string` | `COOL便` / `ES配送` |
| `delivery_corp` | `string` | `ヤマト運輸` / `自社便` |
| `delivery_corp_cutlery` | `string` | Công ty giao dụng cụ |
| `cargo_count` | `int` | Số kiện hàng |
| `delivery_time` | `string` | Khung giờ giao |
| `freezer_count` | `int` | Số tủ đông |
| `vending_machine_count` | `int` | Số máy bán hàng tự động |
| `warehouse_id` | `string` | ID kho `WH#####` |
| `warehouse_name` | `string` | Tên kho |
| `status` | `string` | `0` = active |

**Kho (warehouse_id):**

| ID | Tên |
|---|---|
| `WH00001` | 南日本運輸倉庫株式会社 |
| `WH00002` | オージーフーズ三郷物流センター |
| `WH00003` | 関通_東京主管センター |

---

## scraped_plans — 41 records

Master các gói dịch vụ. Download: [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_plans.json)

**Schema:**

| Field | Type | Mô tả |
|---|---|---|
| `plan_id` | `string` | ID plan, ví dụ `ES700` |
| `name` | `string` | Tên plan |
| `menu_type` | `string` | `通常` / `惣菜のみ` |
| `all_food_count` | `int` | Số suất/tháng |
| `price_1` | `int` | Giá giao **1 lần**/tháng (JPY) |
| `price_2` | `int` | Giá giao **2 lần**/tháng (JPY) |
| `price_3` | `int` | Giá giao **3 lần**/tháng (JPY) |
| `price_4` | `int` | Giá giao **4 lần**/tháng (JPY) |
| `open_status` | `string` | `公開` = hiện trên app / `非公開` = ẩn |
| `memo` | `string\|null` | Ghi chú nội bộ |

**Danh sách đầy đủ 41 plan (giá đơn vị: JPY/tháng):**

| Plan ID | Tên | Suất/tháng | Giao 1 lần | Giao 2 lần | Giao 3 lần | Giao 4 lần |
|---|---|---|---|---|---|---|
| `ES30` | お試しプラン | 0 | — | — | — | — |
| `ES0` | 30プラン | 30 | 20,000 | — | — | — |
| `ES50` | 50プラン | 50 | 25,000 | — | 35,000 | 40,000 |
| `ES50A` | 50プラン（おかわり） | 50 | 15,000 | — | — | — |
| `ES60` | 60プラン（選択不可） | 60 | — | — | — | — |
| `ES74` | 74プラン（選択不可） | 74 | — | — | — | — |
| `ES75` | 75プラン（選択不可） | 75 | — | — | — | — |
| `ES80` | 80プラン | 80 | 42,400 | 47,400 | 62,400 | 67,400 |
| `ES100` | 100プラン | 100 | 40,000 | 45,000 | 55,000 | 60,000 |
| `ES100A` | 100プラン（おかわり） | 100 | 30,000 | — | — | — |
| `ES120` | 120プラン | 120 | — | — | — | — |
| `ES146` | 146プラン（選択不可） | 146 | — | — | — | — |
| `ES150` | 150プラン | 150 | 55,000 | 60,000 | 70,000 | 75,000 |
| `ES150A` | 150プラン（おかわり） | 150 | 45,000 | — | — | — |
| `ES70` | 160プラン（選択不可） | 160 | — | — | — | — |
| `ES200` | 200プラン | 200 | 70,000 | 75,000 | 85,000 | 90,000 |
| `ES200A` | 200プラン（おかわり） | 200 | 60,000 | — | — | — |
| `ES220` | 220プラン（選択不可） | 220 | — | — | — | — |
| `ES250` | 250プラン | 250 | 85,000 | 90,000 | 100,000 | 105,000 |
| `ES300` | 300プラン | 300 | 100,000 | 105,000 | 115,000 | 120,000 |
| `ES350` | 350プラン | 350 | 115,000 | 120,000 | 130,000 | 135,000 |
| `ES400` | 400プラン | 400 | 130,000 | 135,000 | 145,000 | 150,000 |
| `ES450` | 450プラン | 450 | 145,000 | 150,000 | 160,000 | 165,000 |
| `ES500` | 500プラン | 500 | 160,000 | 165,000 | 175,000 | 180,000 |
| `ES550` | 550プラン | 550 | 175,000 | 180,000 | 190,000 | 195,000 |
| `ES600` | 600プラン | 600 | 190,000 | 195,000 | 205,000 | 210,000 |
| `ES650` | 650プラン | 650 | 210,000 | 215,000 | 240,000 | 245,000 |
| `ES700` | 700プラン | 700 | 230,000 | 235,000 | 260,000 | 265,000 |
| `ES750` | 750プラン | 750 | 250,000 | 255,000 | 280,000 | 285,000 |
| `ES800` | 800プラン | 800 | 270,000 | 275,000 | 300,000 | 305,000 |
| `ES850` | 850プラン | 850 | 290,000 | 295,000 | 320,000 | 325,000 |
| `ES900` | 900プラン | 900 | 310,000 | 315,000 | 340,000 | 345,000 |
| `ES950` | 950プラン | 950 | 330,000 | 335,000 | 360,000 | 365,000 |
| `ES1000` | 1000プラン | 1,000 | 350,000 | — | 380,000 | — |
| `ES1200` | 1200プラン | 1,200 | 430,000 | — | 460,000 | — |
| `ES1400` | 1400プラン | 1,400 | 510,000 | — | 540,000 | — |
| `ES1600` | 1600プラン | 1,600 | 590,000 | — | 620,000 | — |
| `ES1800` | 1800プラン | 1,800 | 670,000 | — | 700,000 | — |
| `ES2000` | 2000プラン | 2,000 | 750,000 | — | 780,000 | — |
| `ES2200` | 2200プラン | 2,200 | 830,000 | — | 860,000 | — |
| `ES3000` | 3000プラン | 3,000 | 1,150,000 | — | 1,180,000 | — |

> **Ghi chú:** `—` = không có option này. Giá tăng theo số lần giao/tháng (nhiều lần = đắt hơn). Các plan `選択不可` = không thể chọn mới, chỉ giữ cho khách cũ.

---

## scraped_trial_plans — 30 records

Hợp đồng dùng thử miễn phí. 3 tháng × ~10 records.

| Field | Type | Mô tả |
|---|---|---|
| `trial_plan_id` | `string` | `TR#####` |
| `customer_name` | `string` | Tên khách hàng |
| `menu_ym` | `string` | Tháng dùng thử |
| `plan_name` | `string` | Plan đang thử |
| `delivery_week` | `string` | Tuần giao |
| `delivery_day` | `string` | Ngày giao |
| `full_address` | `string` | Địa chỉ đầy đủ |
| `tel` | `string` | *(anonymized)* |
| `status` | `string` | Trạng thái |
