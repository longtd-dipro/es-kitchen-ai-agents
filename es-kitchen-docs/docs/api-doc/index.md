# API Doc — Mockup & API Guide

Tập hợp các trang **mockup tương tác + tài liệu API** cho từng feature. Mỗi trang tích hợp sẵn UI prototype, đặc tả endpoint, enum, và luồng nghiệp vụ — phục vụ đội FE/Mobile đọc song song với code.

!!! info "Cách dùng"
    Bấm vào nút **`{ } API仕様`** (góc phải dưới màn hình) để mở panel đặc tả API.
    Bấm nút **`🏷️ FE注釈`** để bật/tắt nhãn tên field trực tiếp trên UI.

---

## Company – Contract Phase 2

**Scope:** Quản lý công ty mẹ–con, hợp đồng, approval pipeline giữa E02 và E03.

| Màn hình | Persona | Mô tả | Mở |
|---|---|---|---|
| **Index / Overview** | All | Lifecycle, conventions API, danh mục màn hình | [Mở →](contract/index.html){target=_blank} |
| Form đăng ký dùng thử | Public | Khách doanh nghiệp điền form → trial request | [Mở →](contract/company-sublocation/trial_registration_mockup.html){target=_blank} |
| Quản lý công ty / chi nhánh | E03 | Danh sách toàn bộ công ty + cây Mẹ–Con, import CSV | [Mở →](contract/system-admin/list_location_mockup.html){target=_blank} |
| Danh sách chi nhánh con | E02 | Công ty Mẹ xem/tạo/đổi vai/xóa các công ty con | [Mở →](contract/company-sublocation/list_sub_location_mockup.html){target=_blank} |
| Thông tin cơ bản (基本情報) | E02 | Xem/sửa basic-info của công ty mình hoặc chi nhánh con | [Mở →](contract/company-sublocation/location_basic_infor_mockup.html){target=_blank} |
| Người phụ trách (担当者) | E02 | Danh sách liên hệ MAIN/BILLING/SUB + tài khoản đăng nhập | [Mở →](contract/company-sublocation/contact_mockup.html){target=_blank} |
| Danh sách hợp đồng (契約一覧) | E02 | Hợp đồng của công ty / chi nhánh + trạng thái duyệt | [Mở →](contract/company-sublocation/list_contract_of_location.html){target=_blank} |
| Chi tiết / Đăng ký hợp đồng | E02 | Form 3 bước tạo/sửa hợp đồng → gửi duyệt PENDING | [Mở →](contract/company-sublocation/contract_detail_mockup.html){target=_blank} |
| Lịch sử thay đổi (変更履歴) | E02 | Audit log read-only của công ty / chi nhánh | [Mở →](contract/company-sublocation/location_history_changes_mockup.html){target=_blank} |
| Popup chọn Master | E02 | Popup chọn 委託配送業者 (deliverers) & 中継先 (relays) | [Mở →](contract/company-sublocation/selection_popup.html){target=_blank} |

---

## User Engagement — Phase 2

**Scope:** Tương tác người dùng trên App di động E01 — khai báo dị ứng, đánh giá sản phẩm, khảo sát, wishlist tháng sau.

| Màn hình | Persona | Mô tả | Mở |
|---|---|---|---|
| **Index / Overview** | All | 6 nghiệp vụ, conventions API, danh mục màn hình | [Mở →](user-engagement/index.html){target=_blank} |
| My Page · Allergen Settings | E01 | Khai báo dị ứng lần đầu (onboarding) + cài đặt trong profile | [Mở →](user-engagement/user/user_allergy_profile_mobile.html){target=_blank} |
| Menu · Allergen Filter | E01 | Danh sách món + bottom-sheet lọc dị ứng (ẩn / cảnh báo) | [Mở →](user-engagement/user/allergy_filter_mobile.html){target=_blank} |
| Product Detail · Reviews | E01 | Chi tiết món + tab đánh giá công khai cùng công ty | [Mở →](user-engagement/user/product_detail_reviews_mobile.html){target=_blank} |
| Order History · Review & Feedback | E01 | Đơn COMPLETED → chấm sao từng món + chip lý do + ご意見 | [Mở →](user-engagement/user/product_review_mobile_mockup.html){target=_blank} |
| Survey from Admin | E01 | Thông báo khảo sát từ Admin → form câu hỏi, khoá khi hết hạn | [Mở →](user-engagement/user/survey_notification_from_admin_mobile.html){target=_blank} |
| Next-month Wishlist | E01 | Bình chọn thực đơn tháng sau ≤15 món, thang 3 bậc | [Mở →](user-engagement/user/next_month_menu_survey_wishlist_from_company.html){target=_blank} |

---

!!! note "Thêm feature mới"
    Để thêm trang API Doc cho feature mới, đặt HTML files vào `docs/api-doc/<feature-name>/` và cập nhật trang này + `mkdocs.yml`.
