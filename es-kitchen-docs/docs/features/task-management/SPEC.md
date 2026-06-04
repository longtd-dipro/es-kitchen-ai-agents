# SPEC: Task Management — Quản lý Công việc Nội bộ

> Domain: `BF_TASK MANAGEMENT` · Backlog ID: ESKITCHEN-1248 · Epic: E03 System Admin Web
> Phase 2 · SPEC Transfer: False (chưa transfer) · Tạo: 2026-06-03

---

## Mô tả nghiệp vụ

Task Management là hệ thống quản lý công việc nội bộ dành cho các nhân viên vận hành (System Admin và các phòng ban). Hệ thống tự động sinh Task khi có sự kiện nghiệp vụ (ví dụ: tạo hợp đồng mới, sự cố giao hàng) và cho phép điều phối công việc giữa các phòng ban thông qua giao diện Kanban. Mục tiêu là giảm tải điều phối thủ công, đảm bảo mọi công việc được giao đúng người — đúng thời điểm — có thể truy vết lịch sử.

---

## Actors & Preconditions

| Actor | Repo | Vai trò |
|---|---|---|
| **E03 — System Admin** | `es-kitchen-web-admin` + `es-kitchen-api` | Xem danh sách, Kanban, tạo Task thủ công, quản lý Template, xem lịch sử |
| **Phòng ban / Nhân sự được giao** | `es-kitchen-web-admin` | Xem Task được assign, cập nhật trạng thái, xem chi tiết |

**Preconditions:**
- Người dùng phải đăng nhập với tài khoản System Admin hoặc Role nội bộ có quyền xem/thao tác Task.
- Role-based access: một số phòng ban chỉ xem Task của chính họ — **không xem Task của phòng ban khác**.
- Tích hợp Slack phải được cấu hình sẵn ở cấp hệ thống (admin setup) để gửi notification.

**Phạm vi repo:** Cross-repo — `es-kitchen-api` (BE) + `es-kitchen-web-admin` (E03 FE).
**Contract Lock cần thiết:** Có (2 repo trở lên).

**TODO (BA):** Xác nhận danh sách "Role nội bộ" cụ thể nào (ngoài System Admin) được phép xem/thao tác Task — cần client confirm cấu trúc phòng ban.

---

## Stories & Happy Path

### ST-01: Task List — Danh sách công việc

**Mô tả:** Hiển thị danh sách các Task chưa hoàn thành liên quan đến Role của người dùng đang đăng nhập.

**Happy Path:**
1. Người dùng vào màn hình Task List.
2. Hệ thống lấy danh sách Task theo Role/phòng ban của người dùng — chỉ hiển thị Task chưa hoàn thành (status != Done).
3. Danh sách hiển thị: Tiêu đề Task, Trạng thái, Người phụ trách, Ngày tạo, Hợp đồng liên quan (nếu có).
4. Người dùng có thể nhấn vào Task để xem chi tiết (→ ST-04).
5. Người dùng **không thể** sửa trạng thái trực tiếp từ màn hình này.

**Acceptance Criteria:**
- [ ] Chỉ hiển thị Task chưa hoàn thành (status ≠ "Done") của Role hiện tại.
- [ ] Task của Role/phòng ban khác không xuất hiện trong danh sách (nếu user không có quyền xem toàn bộ).
- [ ] Danh sách có thể phân trang hoặc scroll vô hạn.
- [ ] Nhấn vào Task → mở màn hình chi tiết (ST-04).
- [ ] Không có nút/action nào cho phép sửa trạng thái từ màn hình list này.

**TODO (BA):** Xác nhận System Admin có xem được Task của TẤT CẢ phòng ban không, hay chỉ phòng ban mình?

---

### ST-02: Task Automatic Generation — Tự động sinh Task

**Mô tả:** Hệ thống tự động tạo Task dựa trên logic định sẵn khi có sự kiện nghiệp vụ (trigger event). Task được giao tự động cho phòng ban/nhân sự liên quan.

**Happy Path:**
1. Sự kiện nghiệp vụ xảy ra (ví dụ: Hợp đồng mới được tạo, Hợp đồng được cập nhật trạng thái).
2. Hệ thống kiểm tra xem sự kiện có khớp với Trigger của Task Template nào không (→ ST-07).
3. Nếu khớp → hệ thống tạo Task mới từ Template tương ứng.
4. Task được gán tự động cho phòng ban/nhân sự được định nghĩa trong Template.
5. Task xuất hiện trong Task List (ST-01) và Kanban (ST-03) của phòng ban được giao.
6. Slack notification được gửi đến channel liên quan (→ ST-09).

**Acceptance Criteria:**
- [ ] Khi trigger event xảy ra → Task được tạo tự động trong vòng 30 giây (hoặc near-realtime).
- [ ] Task được assign đúng phòng ban/nhân sự theo cấu hình Template.
- [ ] Nếu không có Template khớp với trigger → không tạo Task, không báo lỗi với user.
- [ ] Task tự động sinh có trạng thái khởi tạo là "Chưa làm" (Todo).
- [ ] Thông tin hợp đồng liên quan được gắn vào Task nếu trigger từ hợp đồng.
- [ ] Lịch sử ghi nhận: Task được tạo tự động bởi hệ thống (không phải user cụ thể).

**Dependencies:** ST-07 (Task Template phải tồn tại trước), ST-09 (Slack notification).

**TODO (BA):** Liệt kê đầy đủ các trigger event ngoài "tạo hợp đồng" — ví dụ: hợp đồng hết hạn, sự cố giao hàng, đơn hàng bị hủy... Cần client confirm danh sách chính thức.

---

### ST-03: Kanban View — Xem và thao tác Kanban

**Mô tả:** Hiển thị Task dạng Kanban theo 4 cột trạng thái. Cho phép chuyển trạng thái Task bằng kéo thả hoặc bấm nút.

**Trạng thái Kanban (theo thứ tự):**
`Chưa làm (Todo)` → `Đang làm (In Progress)` → `Chờ duyệt (Pending Review)` → `Hoàn tất (Done)`

**Happy Path:**
1. Người dùng vào màn hình Kanban.
2. Hệ thống hiển thị Task theo 4 cột trạng thái, lọc theo Role của người dùng.
3. Người dùng kéo Task từ cột này sang cột khác (hoặc bấm nút chuyển trạng thái).
4. Hệ thống cập nhật trạng thái Task, ghi vào lịch sử thay đổi (ST-08).
5. Slack notification được gửi khi trạng thái thay đổi (→ ST-09).

**Acceptance Criteria:**
- [ ] 4 cột hiển thị đúng thứ tự: Todo → In Progress → Pending Review → Done.
- [ ] Kéo thả Task giữa các cột hoạt động trên desktop browser.
- [ ] Bấm nút chuyển trạng thái cũng hoạt động (alternative action ngoài kéo thả).
- [ ] Sau khi chuyển trạng thái → Task di chuyển sang đúng cột ngay lập tức (optimistic update hoặc reload).
- [ ] Mỗi lần chuyển trạng thái → ghi log vào Task History (ST-08).
- [ ] Chỉ hiển thị Task thuộc Role/phòng ban của người dùng (cùng rule với ST-01).

**TODO (BA):** Xác nhận người dùng có thể chuyển trạng thái "ngược" (ví dụ: Done → In Progress) không? Hay chỉ cho phép chuyển tiến?

---

### ST-04: Task Details — Xem và chỉnh sửa chi tiết Task

**Mô tả:** Xem toàn bộ thông tin chi tiết của một Task và cho phép chỉnh sửa các trường được phép.

**Các trường thông tin:**
- Tiêu đề Task
- Người phụ trách (Assignee)
- Trạng thái hiện tại
- Hợp đồng liên quan (Contract link)
- Nội dung chi tiết (Description)
- Lịch sử thay đổi (xem — không sửa)

**Happy Path:**
1. Người dùng nhấn vào Task từ List hoặc Kanban.
2. Màn hình chi tiết mở ra với đầy đủ thông tin.
3. Người dùng sửa các trường: Tiêu đề, Người phụ trách, Nội dung.
4. Người dùng bấm Lưu → hệ thống cập nhật, ghi vào lịch sử thay đổi.
5. Có thể chuyển trạng thái Task trực tiếp từ màn hình này.

**Acceptance Criteria:**
- [ ] Hiển thị đầy đủ: Tiêu đề, Assignee, Trạng thái, Contract link, Description, History.
- [ ] Cho phép sửa: Tiêu đề, Assignee, Description.
- [ ] Cho phép chuyển trạng thái Task từ màn hình chi tiết.
- [ ] Sau khi lưu → ghi log vào Task History với thông tin: field thay đổi, giá trị cũ, giá trị mới, thời gian, người thực hiện.
- [ ] Nếu Contract được gắn → hiển thị link/tên hợp đồng và có thể nhấn để xem hợp đồng.
- [ ] Người dùng không có quyền sửa → các field hiển thị read-only.

**TODO (BA):** Xác nhận quyền sửa Task — mọi người trong phòng ban đều sửa được, hay chỉ Assignee và Admin?

---

### ST-05: (Tính năng bổ trợ — chờ xác nhận)

**Mô tả:** Mục chức năng bổ trợ cho quản lý Task. Tính năng cụ thể chưa được xác nhận.

**TODO (BA):** Cần client xác nhận tính năng cụ thể của story này. Hiện tại để placeholder — không implement cho đến khi có mô tả rõ ràng.

---

### ST-06: Task Manual Creation — Tạo Task thủ công

**Mô tả:** Admin hoặc Role được phép tạo Task thủ công (không qua trigger tự động).

**Các trường khi tạo:**
- Tiêu đề Task (bắt buộc)
- Nội dung chi tiết (tùy chọn)
- Người phụ trách — Assignee (bắt buộc)
- Trạng thái khởi tạo (mặc định: Todo)
- Hợp đồng liên kết (tùy chọn)

**Happy Path:**
1. Người dùng có quyền nhấn "Tạo Task mới".
2. Form tạo Task hiển thị.
3. Người dùng điền Tiêu đề, chọn Assignee, nhập nội dung (tùy chọn), chọn hợp đồng liên kết (tùy chọn).
4. Bấm Lưu → Task được tạo với trạng thái mặc định "Todo".
5. Task xuất hiện trong Kanban (ST-03) và List (ST-01) của phòng ban được giao.
6. Slack notification được gửi đến Assignee (→ ST-09).

**Acceptance Criteria:**
- [ ] Chỉ Role được phép mới thấy nút "Tạo Task mới".
- [ ] Tiêu đề và Assignee là bắt buộc — form validate trước khi submit.
- [ ] Trạng thái khởi tạo mặc định là "Todo" nhưng có thể chọn lại.
- [ ] Task thủ công được ghi nhận là "tạo bởi [tên user]" trong lịch sử.
- [ ] Sau khi tạo → Task xuất hiện ngay trong Kanban và List mà không cần reload trang.

**TODO (BA):** Xác nhận Role nào ngoài System Admin được phép tạo Task thủ công.

---

### ST-07: Task Template — Mẫu Task

**Mô tả:** Định nghĩa trước các mẫu Task. Khi Trigger kích hoạt → hệ thống tự động sinh Task từ Template.

**Cấu trúc Template:**
- Tên Template
- Tiêu đề Task (có thể dùng biến động, ví dụ: `{contract_name}`)
- Nội dung mặc định
- Phòng ban/Assignee mặc định
- Trạng thái khởi tạo
- Trigger (sự kiện kích hoạt — ví dụ: "Hợp đồng mới")

**Happy Path (quản lý Template):**
1. Admin vào màn hình quản lý Template.
2. Tạo Template mới: điền Tên, Tiêu đề, Nội dung, Assignee, Trigger.
3. Lưu Template → kích hoạt ngay hoặc để Draft.
4. Khi Trigger xảy ra → hệ thống dùng Template để sinh Task (→ ST-02).

**Acceptance Criteria:**
- [ ] Có thể tạo, sửa, xóa (hoặc vô hiệu hóa) Template.
- [ ] Một Template phải có ít nhất: Tên, Trigger, Assignee.
- [ ] Có thể tạo nhiều Template cho cùng một Trigger (→ sinh ra nhiều Task).
- [ ] Template bị xóa/vô hiệu hóa → không tự động sinh Task mới, các Task đã sinh không bị ảnh hưởng.
- [ ] Tiêu đề và Nội dung Template hỗ trợ biến động (placeholder) nếu cần.

**Dependencies:** ST-02 (tự động sinh Task từ Template).

**TODO (BA):** Xác nhận danh sách Trigger chính thức và biến động (template variable) nào được hỗ trợ.

---

### ST-08: Task History Management — Lịch sử thay đổi

**Mô tả:** Lưu trữ và hiển thị toàn bộ lịch sử thay đổi của một Task.

**Thông tin ghi nhận mỗi lần thay đổi:**
- Loại thay đổi: Đổi trạng thái / Đổi người phụ trách / Sửa nội dung / Tạo mới
- Giá trị cũ → Giá trị mới
- Thời gian thay đổi (timestamp)
- Người thực hiện (hoặc "System" nếu tự động)

**Happy Path:**
1. Người dùng mở màn hình chi tiết Task (ST-04).
2. Cuộn xuống section Lịch sử.
3. Hiển thị timeline các thay đổi theo thứ tự thời gian (mới nhất lên đầu).

**Acceptance Criteria:**
- [ ] Mọi thay đổi trạng thái đều được ghi log tự động.
- [ ] Mọi thay đổi Assignee, Tiêu đề, Nội dung đều được ghi log.
- [ ] Task được tạo tự động → ghi "Created by System via Template: {template_name}".
- [ ] Task được tạo thủ công → ghi "Created by {user_name}".
- [ ] Lịch sử không thể bị sửa hoặc xóa bởi bất kỳ user nào.
- [ ] Hiển thị tối thiểu 50 entries gần nhất, có thể xem thêm (load more / phân trang).

---

### ST-09: Slack Notification — Thông báo Slack

**Mô tả:** Hệ thống tự động gửi thông báo đến Slack khi có cập nhật hoặc thay đổi đối với Task.

**Các sự kiện gửi Slack:**
- Task mới được tạo (tự động hoặc thủ công) — thông báo đến Assignee/channel liên quan
- Trạng thái Task thay đổi
- Người phụ trách (Assignee) bị thay đổi — thông báo đến Assignee mới

**Happy Path:**
1. Sự kiện xảy ra (Task tạo mới / chuyển trạng thái / đổi Assignee).
2. Hệ thống compose message Slack với thông tin: Tên Task, loại thay đổi, link đến Task.
3. Message được gửi đến Slack channel/user được cấu hình.

**Acceptance Criteria:**
- [ ] Notification gửi thành công trong vòng 60 giây kể từ khi sự kiện xảy ra.
- [ ] Nếu Slack gửi thất bại → hệ thống retry tối đa 3 lần, sau đó ghi log lỗi (không hiển thị lỗi cho user).
- [ ] Message Slack chứa: Tên Task, loại thay đổi, người thực hiện, link đến màn hình Task detail.
- [ ] Có thể cấu hình bật/tắt Slack notification ở cấp hệ thống (Admin setting).

**Dependencies:** Slack Webhook URL phải được cấu hình trong System Settings (thuộc domain `BF_SYSTEM & OTHER`).

**TODO (BA):** Xác nhận notification gửi đến Slack channel chung hay DM trực tiếp đến Assignee? Có phân channel theo phòng ban không?

---

## Alternative Flows & Edge Cases

| ID | Tình huống | Xử lý kỳ vọng |
|---|---|---|
| EC-01 | Trigger tự động xảy ra nhưng không có Template nào khớp | Không tạo Task, không báo lỗi với user, ghi log hệ thống |
| EC-02 | Assignee bị xóa tài khoản sau khi Task đã giao | Task vẫn tồn tại, hiển thị "Assignee không còn hoạt động", Admin cần re-assign thủ công |
| EC-03 | Kéo thả Kanban trên thiết bị mobile/tablet | **TODO (BA):** Xác nhận Kanban có cần hỗ trợ touch drag-drop không, hay chỉ desktop? |
| EC-04 | Slack webhook lỗi (timeout / rate limit) | Retry 3 lần, ghi log lỗi, không block nghiệp vụ chính |
| EC-05 | Người dùng cố gắng truy cập Task của phòng ban khác qua direct URL | Trả về 403 Forbidden / redirect về danh sách Task của mình |
| EC-06 | Tạo nhiều Task từ cùng 1 trigger event cùng lúc (race condition) | Hệ thống đảm bảo idempotency — mỗi trigger chỉ sinh Task 1 lần |
| EC-07 | Template có Assignee là phòng ban nhưng phòng ban không có nhân sự | **TODO (BA):** Task vẫn tạo nhưng unassigned, hay không tạo và báo lỗi? |

---

## Acceptance Criteria tổng thể

- [ ] **AC-01:** Task List hiển thị đúng Task theo Role người dùng, không lộ Task của phòng ban khác.
- [ ] **AC-02:** Task tự động được sinh trong vòng 30 giây khi trigger event xảy ra.
- [ ] **AC-03:** Kanban hoạt động đúng với 4 cột, kéo thả và bấm nút đều chuyển trạng thái.
- [ ] **AC-04:** Mọi thay đổi Task đều được ghi vào History với đủ thông tin (ai, khi nào, thay đổi gì).
- [ ] **AC-05:** Slack notification gửi trong 60 giây, có retry khi lỗi, không block nghiệp vụ chính.
- [ ] **AC-06:** Tạo Task thủ công validation đầy đủ (Tiêu đề + Assignee bắt buộc).
- [ ] **AC-07:** Template quản lý được (tạo/sửa/vô hiệu hóa), trigger hoạt động đúng.
- [ ] **AC-08:** Phân quyền đúng — chỉ Role được phép mới tạo Task thủ công và quản lý Template.

---

## Out of Scope

- Tích hợp với hệ thống quản lý task bên ngoài (Jira, Notion, Asana, Trello).
- Mobile app (E01) xem/thao tác Task — Task Management chỉ dành cho nội bộ System Admin (E03).
- Task giao cho Company Admin (E02) hoặc Supplier (E04).
- Email notification cho Task (nằm trong domain `BF_SYSTEM & OTHER` nếu cần).
- Reporting/dashboard phân tích hiệu suất công việc (chưa có trong scope Phase 2).
- Export danh sách Task ra CSV/Excel.

---

## Dependencies ngoài feature

| Dependency | Domain | Ghi chú |
|---|---|---|
| Contract events (trigger) | `BF_[HỢP ĐỒNG] Quản lý Hợp đồng` | Cần BE emit event khi tạo/cập nhật hợp đồng |
| Slack Webhook configuration | `BF_[SYSTEM & OTHER] Cấu hình Hệ thống` | Slack webhook URL phải được setup trước |
| Role & Permission system | `BF_[SYSTEM & OTHER] Cấu hình Hệ thống` | Role-based access cho Task |

---

## Bước tiếp theo

Chạy song song sau khi SPEC được sign-off:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/task-management/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/task-management/SPEC.md`"
  (hoặc slash command: `/test/generate_manual_testcases_rbt` cho FULL RBT / `/test/generate_testcases_from_requirements` cho QUICK)
