> Bản dịch tiếng Việt của `ja/01_仕様/住所検索_郵便番号データの取り込み.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Tra địa chỉ: Quy trình nhập dữ liệu mã bưu điện

Quyết định: sổ quyết định S「住所検索のデータの出どころ」(nguồn dữ liệu tra địa chỉ) (#429)・sổ quyết định AA (#583). Nút「住所検索」(tra địa chỉ) trên mọi site đều dùng dữ liệu này.

## Quy định

- Dữ liệu là **`utf_ken_all.csv`** (mã bưu điện theo địa chỉ・UTF-8) trong bộ dữ liệu mã bưu điện do Japan Post công bố (miễn phí).
- **Nhập vào cơ sở dữ liệu (bảng `zip_codes`)**. Không đặt dữ liệu lớn trong repository (`data/` không đưa vào git).
- Cập nhật bằng cách **nhập lại thủ công khi cần** (Japan Post cập nhật khoảng 1 lần/tháng. Tự động cập nhật để sau). Mỗi lần nhập là thay thế toàn bộ.
- Khi 1 mã bưu điện có nhiều địa chỉ thì lấy **bản ghi đầu tiên**. Khi khu phố (町域) là「以下に掲載がない場合」「…一円」「…の次に番地がくる場合」thì để trống khu phố, và bỏ phần trong ngoặc（）. Số nhà・tòa nhà nhập tay.
- Mã bưu điện riêng của cơ sở kinh doanh, hộp thư bưu điện (私書箱) và các mã bưu điện đặc biệt khác không thuộc phạm vi (chỉ dùng `utf_ken_all.csv`).

## Quy trình

1. Từ trang「郵便番号データダウンロード」của Japan Post, tải「住所の郵便番号（全国一括）UTF-8形式」(mã bưu điện theo địa chỉ, toàn quốc, định dạng UTF-8), giải nén và lấy ra `utf_ken_all.csv`.
2. Làm một trong hai cách sau.
   - Đặt vào `data/utf_ken_all.csv` rồi chạy `npm run db:reset` để tạo lại DB (khi mở DB, nếu bảng trống thì tự động nhập).
   - Nhập vào DB hiện tại: `npm run zip:import -- <đường dẫn utf_ken_all.csv>` (cũng có thể chỉ định bằng biến môi trường `ES_ZIP_CSV`).
3. Kiểm tra bằng「住所検索」trên màn hình (ví dụ: 1000005 → 東京都 千代田区 丸の内).

## Hoạt động trước khi nhập

Khi bảng trống (chưa nhập), màn hình chạy bằng **vài bản ghi mẫu** (`ZIP_DEMO` trong `lib/ui/zip.ts`). Sau khi đã nhập, mã bưu điện không tìm thấy sẽ hiện「該当する住所がありません」(không có địa chỉ tương ứng).

## Thành phần

`lib/server/zip.ts` (nhập・tra cứu), `app/api/zip/[zip]/route.ts` (`GET /api/zip/<7 chữ số>`), `lookupZipAsync` trong `lib/ui/zip.ts` (gọi từ màn hình), `scripts/import-zip.mjs`.
