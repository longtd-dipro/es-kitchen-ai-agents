# Thư mục làm việc của Thiết kế màn hình (thiết kế cơ bản)

Dựa trên Web thật (code của repository này), đây là nơi tạo thiết kế màn hình (Excel JA／VI・HTML) bằng skill `screen-design-doc`.
Cách làm・quy định xem `.claude/skills/screen-design-doc/SKILL.md`. **Quyết định thì `docs/決定台帳.md` là chuẩn.**

```
Dữ_liệu/
  _Chung_Thông_báo.py   … 1 file cho toàn hệ thống (câu chữ của thông báo・email. Các màn hình dùng bằng ID)
  _Chung_Mẫu_thao_tác.py       … 1 file cho toàn hệ thống (các thao tác chung như danh sách・xác nhận xóa・kiểm tra nhập liệu)
  <ScreenCode頭>_<機能>.py … 1 chức năng 1 file (ví dụ AW_PLAN_Master_Gói.py). Gốc là assets/_ひな形.py
Đầu_ra/                    … do make.py tạo (không sửa trực tiếp)
  <ブック>/画面設計書_…_JA.xlsx・_VI.xlsx・.html、img/（ảnh đánh số・snapshot）
  _Chung/メッセージ・メール一覧
```

## Cách dùng (chung cho cloud・local)

```bash
npm run dev                                                         # Chạy Web thật trước (http://localhost:3000)
S=.claude/skills/screen-design-doc/scripts
python3 $S/make.py --check   docs/05_画面設計書/Dữ_liệu/<機能>.py      # Kiểm tra dữ liệu (không cần trình duyệt)
python3 $S/make.py --capture docs/05_画面設計書/Dữ_liệu/<機能>.py      # Mở Web thật và xác nhận vị trí của các số
python3 $S/make.py --draft   docs/05_画面設計書/Dữ_liệu/<機能>.py      # Xem thử nội bộ (tạo dù còn mục chưa xác nhận)
python3 $S/make.py --book Web_quản_trị_vận_hành_Master docs/05_画面設計書/Dữ_liệu/AW_M*.py   # 1 site (khu vực) = 1 file
```

- `DEMO_FILE` của dữ liệu là `"http://localhost:3000"`, `url` theo từng trạng thái, đăng nhập là `LOGIN` (ID mẫu xem `lib/domain/seed/account.ts`)
- Những thứ đưa vào git là **dữ liệu (.py)・`Đầu_ra/<ブック>/_release/snapshot.json` (bản đã bàn giao cho phát triển)・HTML (`Đầu_ra/**/*.html`: chuyển đổi Nhật-Việt・có kèm ảnh. hong trả lời 2026-10-05・sổ tiếp nhận #126)**. Không đưa xlsx・ảnh (png)・capture_report.json vào (tạo lại bằng make.py. xlsx bàn giao qua chat hoặc Google Drive)
- **Message List (Excel・chuẩn) không đưa vào git.** Thay vào đó đưa bản sao CSV vào `docs/01_仕様/30_Đơn_yêu_cầu/` để đối chiếu cả trên cloud (quyết định của hong 2026-10-05).
  Khi sửa Excel thì xuất lại ở local và commit:
  ```bash
  python3 .claude/skills/screen-design-doc/scripts/ml_export.py "<Message List の xlsx>" --out docs/01_仕様/30_Đơn_yêu_cầu
  git add docs/01_仕様/30_Đơn_yêu_cầu/MessageList_*.csv && git commit -m "docs: Message List の CSV の写しを更新（<日付>）"
  ```
  make.py đọc xlsx nếu có, nếu không thì đọc CSV có ngày mới nhất, và hiển thị ở đầu là đã đọc cái nào.

## Mẫu CSV (2026-10-05)
`Mẫu_CSV/<entity>.csv` … Mẫu nhập CSV (dòng 1 = tiêu đề. Cùng cột với xuất CSV. Xuất ra từ API `csv.template` của Web thật). Định nghĩa cột (bắt buộc・định dạng・quy tắc giá trị) nằm ở màn hình "Nhập CSV" của từng thiết kế màn hình (ví dụ AW_MODL_004 mục 3.x). Khi thay đổi code thì xuất lại (cùng quy trình với csvpage.js trong scratchpad: đăng nhập → POST /api/domain/csv/template).
- Sheet bổ sung: `SHEETS` của dữ liệu (dữ liệu ban đầu・mẫu CSV, v.v.) sẽ thêm 1 sheet trong Excel và mục "Sheet bổ sung" trong HTML. Ở master vận hành, được ghi trong AW_OPTN (dữ liệu ban đầu)・AW_PLAN (mẫu CSV). Cách tạo lại xem HANDOFF_cloud.md (bản 2026-10-05 mục 1.7・1.8)
