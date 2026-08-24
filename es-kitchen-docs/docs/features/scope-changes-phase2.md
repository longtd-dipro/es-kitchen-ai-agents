# Phase 2 Scope Changes

> Tài liệu thay đổi phạm vi dự án ESKITCHEN — Phase 2
> Nguồn: `management/specification/Business_flow_scope_change.xlsx`
> Cập nhật: 2026-07-14

## Tổng hợp

| BF# | Nghiệp Vụ | Thêm mới | Xóa đi | Cập nhật |
| --- | --- | --- | --- | --- |
| BF01 | [HỢP ĐỒNG] Quản lý Hợp đồng | 21 | 4 | 0 |
| BF02 | [MENU & ORDER] Quản lý Thực đơn & Đặt hàng | 10 | 8 | 0 |
| BF03 | [GIAO HÀNG] Lịch trình & Điều phối | 12 | 4 | 0 |
| BF04 | [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp | 7 | 1 | 0 |
| BF05 | [GIAO HÀNG] Web Đối tác Vận chuyển | 15 | 1 | 0 |
| BF06 | [GIAO HÀNG] App Tài xế | 2 | 3 | 0 |
| BF07 | [THANH TOÁN] Thanh toán & Hoàn tiền | 2 | 4 | 0 |
| BF08 | [THU TIỀN & HÀNG HỦY] Báo cáo Thu tiền & Tiêu hủy | 4 | 2 | 0 |
| BF09 | [TỒN KHO & THIẾT BỊ] Quản lý Tồn kho & Vật tư | 8 | 2 | 0 |
| BF10 | [USER BINDING] Liên kết Nhân viên & Phúc lợi | — | — | — |
| BF11 | [USER ENGAGEMENT] Tương tác & Khảo sát | 0 | 1 | 1 |
| BF12 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) | 7 | 5 | 0 |
| BF13 | [SYSTEM & OTHER] Cấu hình Hệ thống & Tích hợp | 0 | 9 | 0 |
| **Tổng** | | **88** | **44** | **1** |

---

## BF01 — [HỢP ĐỒNG] Quản lý Hợp đồng

**Domain:** `contract-management` | **Repos:** E02, E03

### Thêm mới (21)

- **E03** | QL chi nhánh > Đăng ký chi nhánh mới > **Xuất CSV** (AW_CORPORATE_002)
- **E03** | Quy trình duyệt đăng ký HĐ > **DS đăng ký HĐ** — DS đăng ký mới + thay đổi từ pháp nhân
- **E03** | Quy trình duyệt đăng ký HĐ > **Chi tiết đăng ký HĐ** — xem diff trước/sau
- **E03** | Quy trình duyệt đăng ký HĐ > **Duyệt đăng ký HĐ** — duyệt/từ chối
- **E03** | Quy trình duyệt đăng ký HĐ > Duyệt đăng ký HĐ > **Cấp TK trước**
- **E03** | Quy trình duyệt đăng ký HĐ > Duyệt đăng ký HĐ > **Cài đặt nguồn GT** (pháp nhân/đại lý)
- **E03** | Quy trình duyệt đăng ký HĐ > **Lịch sử phê duyệt**
- **E03** | QL hợp đồng > **DS phí thu** — quản lý theo pháp nhân
- **E03** | QL hợp đồng > DS phí thu > **QL phương thức tính phí**
- **E03** | QL PLAN > DS PLAN > **Nhập / Xuất CSV** (AW_PLAN_001)
- **E03** | QL PLAN > Chi tiết PLAN > **Chi tiết điều chỉnh giá PLAN**
- **E03** | QL PLAN > Chi tiết PLAN > **Điều chỉnh phí theo HĐ**
- **E03** | QL tùy chọn dịch vụ > **Hiển thị tùy chọn**
- **E03** | QL tùy chọn dịch vụ > **CRUD tùy chọn**
- **E03** | QL tùy chọn dịch vụ > CRUD tùy chọn > **QL phí tùy chọn vật tư**
- **E03** | QL tùy chọn dịch vụ > **QL lịch sử phí**
- **E03** | QL tùy chọn dịch vụ > **Xóa / Vô hiệu tùy chọn**
- **E03** | QL giảm giá > **DS giảm giá**
- **E03** | QL giảm giá > **CRUD giảm giá**
- **E03** | QL giảm giá > **QL lịch sử giảm giá**
- **E03** | QL giảm giá > **Vô hiệu giảm giá**

### Xóa đi (4)

- **E03** | AW_CONTRACT_004 | QL hợp đồng > Thêm HĐ > DS đề xuất bên vận chuyển *(timing thực thi khác)*
- **E03** | AW_CONTRACT_004 | QL hợp đồng > Thêm HĐ > Xuất CSV đồng bộ Google MyMap *(không dùng MyMap)*
- **E03** | AW_INVOICE_001 | QL hợp đồng > DS phí thu > Hóa đơn theo hợp đồng *(thay Bill One)*
- **E03** | AW_INVOICE_002 | QL hợp đồng > DS phí thu > Xem trước hóa đơn *(thay Bill One)*

---

## BF02 — [MENU & ORDER] Quản lý Thực đơn & Đặt hàng

**Domain:** `menu-order` | **Repos:** E02, E03

### Thêm mới (10)

- **E03** | QL master sản phẩm > DS sản phẩm > **Xuất CSV** (template mới)
- **E03** | QL danh mục SP > **DS danh mục**
- **E03** | QL danh mục SP > **Chi tiết danh mục** (CRUD + upload hình)
- **E03** | QL danh mục SP > **Xóa danh mục**
- **E03** | Danh sách menu > **Xuất CSV** (template mới)
- **E03** | CRUD menu tháng > **QL tag SP** (NEW, Best-seller...)
- **E03** | CRUD menu tháng > **Thống kê menu** (realtime số SP, đơn chuẩn, max)
- **E03** | QL đơn vật tư > Chi tiết đơn > **Kiểm tra dư miễn phí**
- **E03** | AW_VERSION_001 | QL đơn vật tư > Chi tiết đơn > **Checklist picking**
- **E03** | QL đơn vật tư > Chi tiết đơn > **QL giao vật tư**

### Xóa đi (8)

- **E02** | CW_ORDER_001 | Đặt món hàng tháng > Danh sách menu *(có thể xem trong màn order)*
- **E02** | Đặt món hàng tháng > Tự động tính SL > Kiểm tra vượt hạn mức phúc lợi *(tính trên homepage)*
- **E02** | CW_ORDER_005 | Đặt món hàng tháng > Lịch sử đơn > Đánh giá sao tài xế *(gộp vào review SP)*
- **E03** | AW_PERMISSION_006 | Bảng xếp hạng > Cá nhân hóa *(yêu cầu xóa)*
- **E03** | AW_PERMISSION_007 | Dashboard > Danh sách chỉ số *(yêu cầu xóa)*
- **E03** | AW_PERMISSION_007 | Dashboard > Danh sách task *(yêu cầu xóa)*
- **E03** | CRUD menu tháng > Đề xuất SP phổ biến *(không cần thiết)*
- **E03** | AW_MENU_005 | CRUD menu tháng > Sao chép menu cũ *(không cần thiết)*

---

## BF03 — [GIAO HÀNG] Lịch trình & Điều phối

**Domain:** `delivery-dispatching` | **Repos:** E02, E03

### Thêm mới (12)

- **E03** | QL YC vận chuyển > **DS YC vận chuyển** — search/filter theo tình trạng, ngày, pháp nhân
- **E03** | QL YC vận chuyển > Chi tiết YC > **Chi tiết YC vận chuyển**
- **E03** | QL YC vận chuyển > Chi tiết YC > **YC báo giá bên VC** (notify + email)
- **E03** | QL YC vận chuyển > Chi tiết YC > **QL tình trạng trả lời**
- **E03** | QL YC vận chuyển > Chi tiết YC > **So sánh báo giá**
- **E03** | QL YC vận chuyển > Chọn tuyến > **Chọn điểm trung chuyển**
- **E03** | QL YC vận chuyển > **Chốt bên vận chuyển**
- **E03** | AW_INTERGRATION_002 | QL điểm trung chuyển > DS điểm > **Nhập / Xuất CSV**
- **E03** | AW_INTERGRATION_002 | QL vận chuyển ủy thác > DS bên VC > **Nhập / Xuất CSV**
- **E03** | QL vận chuyển ủy thác > DS bên VC > **Cấp TK hàng loạt**
- **E03** | QL vận chuyển ủy thác > CRUD bên VC > **Phí giao theo khu vực**
- **E03** | QL vận chuyển ủy thác > CRUD bên VC > **Duyệt nội dung bên VC chỉnh sửa**

### Xóa đi (4)

- **E02** | Cài đặt lịch giao > Cài đặt số lần giao/tháng *(ảnh hưởng phí → không để E02 tự đổi)*
- **E02** | Cài đặt lịch giao > Cài đặt riêng theo loại hàng *(thống nhất điều kiện giao)*
- **E03** | AW_SCHEDULE_002 | Màn hình lịch trình > Tự lấy ngày lễ Nhật
- **E03** | AW_SCHEDULE_004 | Màn hình lịch trình > Nhập DS ngày không picking

---

## BF04 — [ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp

**Domain:** `supplier-ordering` | **Repos:** E03, E04

### Thêm mới (7)

- **E03** | AW_INTERGRATION_002 | QL nhà cung cấp > DS NCC > **Nhập / Xuất CSV**
- **E03** | QL nhà cung cấp > DS NCC > **Cấp TK hàng loạt**
- **E03** | QL nhà cung cấp > CRUD NCC > **Duyệt nội dung NCC chỉnh sửa**
- **E04** | Đăng nhập > **Nhập ID / Mật khẩu** (domain tách riêng)
- **E04** | Đăng nhập > **Quên mật khẩu** (domain tách riêng)
- **E04** | **Form đăng ký** — NCC apply thông tin công ty, người phụ trách, hàng cung cấp
- **E04** | Hồ sơ > **Xem / CRUD thông tin NCC**

### Xóa đi (1)

- **E04** | Đổi mật khẩu > Chi tiết đơn nhận

---

## BF05 — [GIAO HÀNG] Web Đối tác Vận chuyển

**Domain:** `delivery-partner` | **Repos:** E05

> Domain E05 xây mới gần như hoàn toàn — thêm 15 tính năng.

### Thêm mới (15)

- **E05** | **Đăng nhập** — Nhập ID/Mật khẩu (domain tách)
- **E05** | **Đăng nhập** — Quên mật khẩu (domain tách)
- **E05** | **Form đăng ký** — nhập thông tin công ty, người phụ trách, khu vực xử lý
- **E05** | **Hồ sơ** — xem/edit thông tin cơ bản công ty VC
- **E05** | Hồ sơ > **QL phí theo khu vực**
- **E05** | Hồ sơ > QL phí theo khu vực > **Nhập / Xuất CSV phí**
- **E05** | Lịch trình giao > **Lịch tuần (timeline)**
- **E05** | Lịch trình giao > **Lịch tháng (tổng hợp)**
- **E05** | QL yêu cầu > **DS yêu cầu**
- **E05** | QL yêu cầu > **Chi tiết / Trả lời yêu cầu**
- **E05** | QL yêu cầu > Chi tiết > **Trả lời OK/NG**
- **E05** | QL yêu cầu > Chi tiết > **Nhập phí giao**
- **E05** | QL yêu cầu > Chi tiết > **Đính kèm báo giá**
- **E05** | QL yêu cầu > Chi tiết > **Gửi câu trả lời**
- **E05** | QL yêu cầu > Chi tiết > **Xem lịch sử trả lời**

### Xóa đi (1)

- **E05** | Đổi mật khẩu > CRUD thông tin tài xế

---

## BF06 — [GIAO HÀNG] App Tài xế

**Domain:** `delivery-driver` | **Repos:** E06

> **Thay đổi lớn: Đổi platform từ App (Flutter) → Web App (React).** Scope mới tập trung giao thực phẩm, không có vật tư.

### Thêm mới (2)

- **E06** | Thay đổi platform > **Quên mật khẩu** (Web App)
- **E06** | Trang chủ > **Chi tiết thông báo** — đọc → update đã đọc; quản lý chưa đọc/đã đọc

### Xóa đi (3)

- **E06** | DA_ESDL_003 | Kiểm tra hàng giao > Kiểm tra vật tư *(vật tư không trong scope Driver)*
- **E06** | Báo cáo hoàn tất giao hàng > Lấy chữ ký báo cáo hoàn tất
- **E06** | Xử lý yêu cầu > Tích hợp HubSpot

---

## BF07 — [THANH TOÁN] Thanh toán & Hoàn tiền

**Domain:** `payment` | **Repos:** E01, E02, E03

### Thêm mới (2)

- **E02** | Hóa đơn > **Tích hợp API hóa đơn** (Bill One)
- **E03** | AW_INVOICE_001 | QL hợp đồng > DS phí thu > **Tích hợp API Bill One**

### Xóa đi (4)

- **E01** | Thanh toán > Chọn phương thức > **Thanh toán Rakuten Pay** *(Elepay không hỗ trợ)*
- **E01** | Thanh toán > Chọn phương thức > **Thanh toán Alipay** *(Elepay không hỗ trợ)*
- **E02** | Hóa đơn > Danh sách hóa đơn *(thay Bill One)*
- **E02** | Hóa đơn > Thông báo liên quan hóa đơn *(thay Bill One)*

---

## BF08 — [THU TIỀN & HÀNG HỦY] Báo cáo Thu tiền & Tiêu hủy

**Domain:** `collection-cancellation` | **Repos:** E06

### Thêm mới (4)

- **E06** | Báo cáo tiêu hủy > **Kiểm tra tồn kho / hàng hủy** — scan barcode, nhập/xác nhận số hủy + tồn thực
- **E06** | Báo cáo tiêu hủy > **Đăng ký tồn kho / hàng hủy** — reflect chênh lệch với tồn logic
- **E06** | Báo cáo tiêu hủy > **Quét mã vạch** — đọc barcode → màn nhập tồn/hủy
- **E06** | Báo cáo tiêu hủy > **Xác nhận kết quả kiểm kê** — chốt trước khi đăng ký

### Xóa đi (2)

- **E06** | Báo cáo tiêu hủy > Báo cáo tiêu hủy *(thay bằng kiểm tra tồn kho/hàng hủy mới)*
- **E06** | Báo cáo tiêu hủy > Báo cáo tiêu hủy riêng lẻ (常温) *(thay bằng kiểm tra mới)*

---

## BF09 — [TỒN KHO & THIẾT BỊ] Quản lý Tồn kho & Vật tư

**Domain:** `inventory-equipment` | **Repos:** E02, E03

### Thêm mới (8)

- **E02** | QL tồn kho > **Danh sách tồn kho** — tồn logic/kiểm kê/chênh lệch/tỷ lệ; tỷ lệ ≥10% → ứng viên tính phí
- **E02** | QL tồn kho > **Chi tiết / Chỉnh sửa tồn kho** — nhập tồn thực tế, lý do chênh lệch
- **E03** | AW_INTERGRATION_002 | QL master vật tư > DS vật tư > **Nhập / Xuất CSV**
- **E03** | AW_INTERGRATION_002 | QL master thiết bị > DS model > **Nhập / Xuất CSV**
- **E03** | AW_ORDER_019 | QL tồn kho (vật tư) > **Điều chỉnh tồn kho** — nhập hàng trong/ngoài hệ thống
- **E03** | AW_INVENTORY_001 | QL kết quả giao > QL tồn kho > **Danh sách tồn kho** — candidate tính phí
- **E03** | AW_INVENTORY_003 | QL kết quả giao > QL tồn kho > **Chi tiết tồn kho**
- **E03** | QL kết quả giao > QL tồn kho > **QL tồn kho bán theo HĐ** (theo chi nhánh)

### Xóa đi (2)

- **E03** | AW_INVENTORY_002 | QL tồn kho (vật tư) > Đăng ký tồn kho *(thay bằng điều chỉnh tồn kho mới)*
- **E03** | QL tồn kho (vật tư) > Xóa tồn kho

---

## BF10 — [USER BINDING] Liên kết Nhân viên & Phúc lợi

**Domain:** `user-binding` | Không có thay đổi trong Phase 2.

---

## BF11 — [USER ENGAGEMENT] Tương tác & Khảo sát

**Domain:** `user-engagement` | **Repos:** E01

### Cập nhật (1)

- **E01** | Hướng dẫn sử dụng > **Tutorial** — đổi từ slide đơn giản → dùng Flutter `showcaseview` package. Onboarding: tutorial động ~10 màn; xem lại từ menu: chỉ hiện màn cố định. ([Figma](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=21186-362850))

### Xóa đi (1)

- **E01** | Mức độ tương tác > Chức năng gửi ý kiến / góp ý *(gộp vào review sản phẩm)*

---

## BF12 — [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner)

**Domain:** `agency-management` | **Repos:** E02, E03

> Thay thế mô hình campaign E02 → mô hình QL giới thiệu tập trung E03.

### Thêm mới (7)

- **E03** | QL giới thiệu > **DS đại lý** — PLAN phí GT apply, số GT, tiền thưởng chưa trả
- **E03** | QL giới thiệu > **CRUD đại lý** — thông tin cơ bản, setting HĐ/thưởng, DS đơn GT
- **E03** | AW_PLAN_001 | QL giới thiệu > CRUD đại lý > **QL PLAN phí GT**
- **E03** | QL giới thiệu > **DS giới thiệu** — DS chéo từ pháp nhân + đại lý
- **E03** | QL giới thiệu > **Chi tiết giới thiệu** — thông tin GT, chốt HĐ, phí, lịch sử
- **E03** | QL giới thiệu > **DS thanh toán phí GT hàng tháng**
- **E03** | QL giới thiệu > **Chi tiết thanh toán phí GT**

### Xóa đi (5)

- **E02** | Chiến dịch giới thiệu > Form giới thiệu KH *(admin liên kết thủ công)*
- **E02** | Chiến dịch giới thiệu > QL lịch sử giới thiệu *(chuyển E03)*
- **E02** | Chiến dịch giới thiệu > Hiển thị ưu đãi GT *(chuyển E03)*
- **E03** | AW_CONTRACT_001 | QL sample > Lịch sử chiến dịch > Hiển thị DS *(campaign qua Hubspot thủ công)*
- **E03** | QL sample > Lịch sử chiến dịch > Tổng hợp tỷ lệ thành công

---

## BF13 — [SYSTEM & OTHER] Cấu hình Hệ thống & Tích hợp

**Domain:** `system-other` | **Repos:** E02, E03

> Toàn bộ Task Management bị xóa theo yêu cầu của Chủ tịch Hosono. Không có thêm mới.

### Xóa đi (9)

- **E02** | Trang cá nhân > Đổi mật khẩu *(có reset password rồi)*
- **E03** | Màn hình QL task > Logic tự tạo task
- **E03** | Màn hình QL task > Kanban view task
- **E03** | Màn hình QL task > Màn hình chi tiết task
- **E03** | Màn hình QL task > Màn hình chi tiết task (phụ)
- **E03** | Màn hình QL task > Tạo task thủ công
- **E03** | Màn hình QL task > Template task
- **E03** | Màn hình QL task > QL lịch sử task
- **E03** | Màn hình QL task > Thông báo qua Slack
