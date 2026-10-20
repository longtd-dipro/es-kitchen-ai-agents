> Bản dịch tiếng Việt của `ja/01_仕様/40_マスタ・料金・請求/プランマスタ.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Master gói (chuẩn)

> **File này là nguồn chuẩn của master gói.** Nguồn gốc của các quyết định là `docs/決定台帳.md` (nếu không khớp thì sổ quyết định là chuẩn). Tên vật lý・kiểu của từng hạng mục xem 「プランマスタ編集」 (Chỉnh sửa master gói) trong `マスタ項目一覧_機種_オプション_値引き.md`.
> `docs/議事録_仕様/プランマスタ_仕様まとめ.md` là tài liệu lịch sử tại thời điểm họp, không phải nguồn chuẩn.
> Cập nhật: 2026-10-12

## 1. 3 quyết định đã chốt (không xem xét lại)

| # | Quyết định | Ý nghĩa |
|---|---|---|
| 1 | **Giá được giữ trực tiếp theo từng course** | Không giữ theo kiểu "giá Standard ＋ giảm giá Lite". Lite cũng có giá riêng của mình theo từng thế hệ (sổ quyết định E "Thế hệ giá" ＝ A, F "Cách giữ giá của gói") |
| 2 | **Gói chỉ giữ ID dòng máy・số máy・pattern** | Tên・dung tích・giá・thời hạn sử dụng tối thiểu của dòng máy do master dòng máy giữ. Không sao chép vào gói (sổ quyết định F "Thiết bị cho mượn tiêu chuẩn", 28-182) |
| 3 | **Đang chọn ＝ dùng để công khai (1 giá trị)** | Không tách 「選択中」 (đang chọn) và 「公開用」 (dùng để công khai) thành hạng mục riêng・cờ riêng (28-180) |

## 2. Vai trò và phạm vi

- Master gói là master trên Web vận hành, quản lý tập trung **giá・giới hạn trên/dưới số lượng cung cấp・số lần giao hàng tiêu chuẩn・thiết bị cho mượn tiêu chuẩn・mức doanh nghiệp chịu・số tiền miễn trừ** của gói (khuôn hợp đồng theo số suất ăn của giới hạn cung cấp hằng tháng).
- Một gói có các tab theo từng course. Hợp đồng (hợp đồng con) giữ **ID gói ＋ course ＋ gói giá đã áp dụng (thế hệ giá)** (28-181).
- Những gì không giữ: thông tin và giá của dòng máy (→ master dòng máy), tùy chọn・giảm giá (→ master tùy chọn・giảm giá), tùy chọn giao hàng・hợp đồng (→ tùy chọn theo từng hợp đồng), đơn giá vật tư (→ master vật tư), phí ban đầu・phí thuê của máy bán hàng tự động (→ tùy chọn OP000008・OP000037. 「初期料金」 (phí ban đầu) của gói đã bị bãi bỏ), tỷ lệ hàng đông lạnh (không giữ: 28-155).
- Gói phí giới thiệu (đại lý) là master riêng (`70_代理店/`).

## 3. Course

| Course | Đông lạnh | Lạnh・thường | Phương thức giao hàng | Ghi chú |
|---|---|---|---|---|
| `ESスタンダード` | Có | Có | Chuyến COOL／chuyến giao ES | Giữ giới hạn trên・dưới và số lần giao hàng tiêu chuẩn của hàng đông lạnh |
| `ESライト（冷蔵庫）` | Không | Có | Chuyến COOL／chuyến giao ES | Thiết bị cho mượn tiêu chuẩn: hoặc 「スタンダードと同じ構成にする」 (dùng cấu hình giống Standard) (mặc định là có・trừ tủ đông), hoặc giữ riêng |
| `ESライト（自販機）` | Không | Có | **Chỉ chuyến giao ES** | Thiết bị cho mượn tiêu chuẩn bắt buộc có dòng máy bán hàng tự động・không đưa tủ lạnh và tủ đông vào |

- Các course mà gói dùng được chọn nhiều (tab của course không dùng thì bị vô hiệu).

## 4. Hạng mục chung của gói

| Hạng mục | Nội dung |
|---|---|
| ID gói | ES ＋ 6 chữ số (ví dụ ES000004). Sau khi đánh số thì không đổi |
| Tên gói công khai / Tên gói quản lý | Mỗi tên tối đa 60 ký tự. Tên công khai dùng cho Web doanh nghiệp và hóa đơn, tên quản lý dùng nội bộ・danh sách・tìm kiếm. Khi nhập tên công khai mà tên quản lý trống thì điền cùng giá trị |
| Trạng thái công khai | Công khai／không công khai. Không công khai thì không hiện ở đăng ký・thay đổi gói trên Web doanh nghiệp. Không ảnh hưởng tới cơ sở đang có hợp đồng. Xóa là xóa logic. **Khác với 「公開用」 (dùng để công khai) của thế hệ giá** (đây là công khai của chính gói) |
| Tổng giới hạn cung cấp hằng tháng | Số suất ăn (ví dụ gói 100 ＝ 100). Số nguyên từ 0 trở lên・tối đa 9,999 |
| Mức doanh nghiệp chịu (đã gồm thuế・1 suất) | Mặc định 100 yên. Khoản đã bao gồm trong phí gói (không tính phí thêm). Trở thành giá trị ban đầu của hợp đồng con |
| Thuế suất phần doanh nghiệp chịu / Thuế suất phí cơ bản | Chọn từ master thuế suất. Mặc định 8% / 10% |
| Số tiền miễn trừ (tolerance) | Phạm vi cho phép của chênh lệch tồn kho (yên). Phần vượt quá được tính phí trong quyết toán thực tế. **Giữ theo gói ＋ course** (trả lời của hong 2026-10-12. Cũ: 1 giá trị theo đơn vị gói) |
| Tỷ lệ cơ bản × hệ số | Hệ số nhân vào số lượng tiêu chuẩn của đơn hàng. Không hiển thị ở danh sách |
| Số người sử dụng tham khảo | Ví dụ 14 người. **Mục đích chính là mức tham khảo để gợi ý (suggest) gói cho khách hàng** (trả lời của hong 2026-10-12). Không dùng cho hóa đơn・phán định. Chi tiết cách đưa ra gợi ý ở chương 14 |
| Course | Chọn nhiều như chương 3 |

## 5. Giới hạn trên・dưới số lượng cung cấp và số lần giao hàng (theo từng course)

| Hạng mục | ESスタンダード | ESライト（冷蔵庫／自販機） |
|---|---|---|
| Đông lạnh_số lượng cung cấp hằng tháng trên／dưới | Có. Dưới ≦ trên | Không |
| Lạnh・thường_số lượng cung cấp hằng tháng trên／dưới | Có. Dưới ≦ trên | Có. **Trên ＝ tổng giới hạn cung cấp hằng tháng** (khác thì không lưu được) |
| Kiểm tra tổng giới hạn trên | Giới hạn trên đông lạnh ＋ giới hạn trên lạnh・thường **≧** tổng giới hạn cung cấp hằng tháng (không phải ＝) | Như trên |
| Số lần giao hàng tiêu chuẩn (lạnh・thường) | Từ 1 lần trở lên／tháng. Theo từng nhóm nhiệt độ | Như bên trái |
| Số lần giao hàng tiêu chuẩn (đông lạnh) | Từ 1 lần trở lên／tháng. **Giá trị ban đầu là 1 lần cho tất cả các gói** | Không |

- Ví dụ số lần giao hàng tiêu chuẩn (bảng tủ lạnh): ES50 ＝ 1 lần／ES100〜600 ＝ 2 lần／ES650 trở lên ＝ 4 lần. Phần số lần giao hàng của hợp đồng vượt quá tiêu chuẩn sẽ gắn thêm tùy chọn thêm số lần giao hàng (OP000001) (theo từng nhóm nhiệt độ・không bù trừ).
- Số lượng giao 1 lần ＝ giới hạn trên ÷ số lần giao hàng tiêu chuẩn (làm tròn lên). Dùng để phán định kích thước dòng máy (tính tự động・không nhập).
- Không giữ giới hạn trên cho từng sản phẩm.

## 6. Tỷ lệ sắp hết

- Tỷ lệ phán định badge 「残りわずか」 (sắp hết) của ứng dụng cá nhân. **Giá trị ban đầu 25%**.
- **Vận hành thiết lập trên màn hình master theo gói ＋ course** (không để là giá trị cố định trong code).
- Ngưỡng ＝ làm tròn xuống (số lượng đặt thực tế của cơ sở × tỷ lệ). Hiển thị khi tồn kho lý thuyết ≦ ngưỡng và ngưỡng ≧ 1. Quy tắc "gói từ 100 trở xuống" đã bị bãi bỏ.
- Lưu ý: "làm tròn xuống" này chỉ áp dụng ở chỗ tính ngưỡng từ số lượng đặt. Phần lẻ của số tiền (chương 8) là làm tròn (tứ xả ngũ nhập).

## 7. Giá (giữ trực tiếp theo từng course・nhiều thế hệ)

### 7.1 Cách giữ

- Giá được giữ trong **bảng 「価格プラン」 (gói giá) bên trong tab của course**, **1 dòng ＝ 1 thế hệ giá**.
- Nội dung 1 dòng: dùng để công khai (đang chọn)／tên gói giá (giá gốc・lần sửa đổi thứ nhất…. Tên thế hệ dùng chung toàn hệ thống)／kỳ bắt đầu・kỳ kết thúc／**giá (chuyến COOL)／giá (chuyến giao ES)** (chưa thuế・phí gói 1 tháng)／phân tích (tự động).
- **Không giữ theo kiểu lấy giá Standard làm chuẩn rồi giảm giá cho Lite.** Cả 3 course đều nhập thẳng giá của mình. Chênh lệch chuyển đổi Lite → Standard (giảm giá DC000021) **chỉ được tính ra** như chênh lệch giá của cùng thế hệ, không phải là nơi giữ giá.
- Giá của ESライト（自販機） là **chỉ chuyến giao ES**. **Phí thuê được tính gộp vào giá** (OP000037 đã bãi bỏ・2026-10-13 hong). Phí ban đầu không gộp vào giá (OP000008). Phần máy tiêu chuẩn bao gồm trong gói đã nằm trong giá, chỉ những máy thêm vào mới tính theo phí hằng tháng của master dòng máy.
- Phân tích (tính tự động・không nhập): phần doanh nghiệp chịu (chưa thuế) và phí cơ bản ＝ giá − phần doanh nghiệp chịu (chưa thuế). Giá làm phí cơ bản dưới 0 yên thì không lưu được.
- Kỳ bắt đầu・kỳ kết thúc chỉ là **tham khảo (ghi nhận)**. Hợp đồng dùng thế hệ nào không quyết định theo kỳ mà theo 「適用された価格プラン」 (gói giá đã áp dụng) của hợp đồng con. Các kỳ không chồng nhau (khi thêm dòng thì kỳ kết thúc của dòng trước được điền ngày hôm trước).

### 7.2 Đang chọn ＝ dùng để công khai (1 giá trị)

- **Mỗi course có đúng 1 dòng dùng để công khai (＝ đang chọn)**. 0 dòng・từ 2 dòng trở lên thì không lưu được.
- Chỉ thế hệ dùng để công khai mới hiện ở đăng ký・thay đổi gói trên Web doanh nghiệp. Đây là thế hệ ban đầu của hợp đồng con tạo mới.
- Thế hệ mới nhất không tự động trở thành dùng để công khai. Vận hành chọn.
- Hợp đồng mới dùng nguyên thế hệ dùng để công khai tại thời điểm đăng ký (kể cả khi ngày bắt đầu áp dụng của thế hệ muộn hơn ngày bắt đầu hợp đồng. Ngày bắt đầu áp dụng chỉ là tham khảo). Muốn tiếp tục giá cũ thì vận hành chọn ngày chuyển đổi dùng để công khai. Hợp đồng con của các tháng sau kế thừa thế hệ của tháng trước 〔sổ quyết định AS #769・#780〕.
- Thế hệ không đặt làm dùng để công khai có thể dùng làm giá riêng cho doanh nghiệp cụ thể (chọn thế hệ ở hợp đồng con. Không gắn với doanh nghiệp).
- Không giữ `選択中` và `公開用` thành hạng mục riêng・cờ riêng・hiển thị màn hình riêng.

### 7.3 Ảnh hưởng tới hợp đồng hiện có

- **Thêm thế hệ mới cũng không làm thay đổi giá của các hợp đồng con hiện có.** Hợp đồng con tự giữ 「適用された価格プラン」, giữ nguyên thế hệ lúc tạo.
- Việc chuyển thế hệ không làm ở master gói. **Làm từ phía hợp đồng (thay đổi hàng loạt ở danh sách hợp đồng con)**: lọc theo gói・course・thế hệ giá, chỉ định chu kỳ bắt đầu áp dụng, và chỉ áp cho các hợp đồng con chưa xác định (không đổi các tháng đã xác định・đã lập hóa đơn). Thông báo trước do vận hành làm thủ công bằng phát thông báo.
- Sửa giá của thế hệ đang được dùng được xử lý là "đính chính sai sót" và để lại lịch sử. Chỉ xóa được các thế hệ không được dùng.

## 8. Tính phần doanh nghiệp chịu (chưa thuế)

```
企業負担分（税抜）
= 企業負担額（税込・1食）
× 月次提供上限の合計
÷（1 + 企業負担分の税率）
```

- **Dưới 1 yên thì làm tròn (tứ xả ngũ nhập)** (không làm tròn xuống). Giống sổ quyết định E "Phần lẻ khi tính chưa thuế từ đã gồm thuế ＝ làm tròn".
- Phí cơ bản (chưa thuế) ＝ giá (chưa thuế) − phần doanh nghiệp chịu (chưa thuế).
- Ví dụ: mức doanh nghiệp chịu 100 yên・giới hạn cung cấp hằng tháng 100・thuế suất 8% → 100 × 100 ÷ 1.08 ＝ 9,259.259… → **9,259 yên**. Nếu giá là 49,500 yên thì phí cơ bản 40,241 yên.
- Hóa đơn: khi 「福利厚生の適用」 (áp dụng phúc lợi) của hợp đồng con là ON thì 2 dòng (phí cơ bản 10%／phần doanh nghiệp chịu 8%), OFF thì gộp thành 1 dòng. Khoản mục (①) luôn là 2 dòng, số tiền và thuế không đổi.

## 9. Thiết bị cho mượn tiêu chuẩn (chỉ ID dòng máy・số máy・pattern)

- Gói chỉ giữ **ID dòng máy・số máy・pattern (tiêu chuẩn／thay thế)・ghi chú**.
- **Tên dòng máy・dung tích・giá・thời hạn sử dụng tối thiểu được tham chiếu từ master dòng máy. Không sao chép vào gói.** Thay đổi master dòng máy cũng không ảnh hưởng tới hợp đồng đã tạo (hợp đồng giữ giá trị tại thời điểm thiết lập).
- Các dòng máy・số máy ghi ở đây là "thiết bị bao gồm trong gói" ＝ miễn phí cả phí ban đầu lẫn phí hằng tháng. Không để phán định miễn phí hay không ở phía master dòng máy. Master dòng máy không giữ "gói bao gồm tiêu chuẩn" (xem ở thiết bị cho mượn tiêu chuẩn của master gói).
- Pattern: tiêu chuẩn／thay thế. Các dòng cùng pattern được coi là 1 cấu hình (thay thế là cấu hình có thể chọn thay cho tiêu chuẩn khi đăng ký).
- Khi 「相談して決める」 (quyết định qua trao đổi) ＝ có, Web doanh nghiệp chỉ hiển thị cấu hình tiêu chuẩn, thay đổi thì qua trao đổi.
- Vật dụng ban đầu・vật tư bao gồm trong gói (số lượng theo vật tư × course・số lượng miễn phí trong tháng) được nhập ở card trong chi tiết master gói. Thông tin vật tư nằm ở master vật tư.

## 10. CSV

- Lối vào **chỉ có 1 là 「CSV取込」 (nhập CSV) ở danh sách master gói**. Một file chứa các dòng gói／course／giá／thiết bị (28-183). File chỉ có dòng thiết bị cũng dùng cùng lối vào. Không đặt nút CSV thiết bị riêng.
- Cột của dòng thiết bị: ID gói・course・pattern・ID dòng máy・số máy・ghi chú. Thay thế theo dòng CSV cho từng ID gói ＋ course.
- Số tiền trong CSV chỉ là số (`1000`, không kèm 「円」). Ô trống ＝ không thay đổi khi cập nhật, muốn xóa thì `-`. Tối đa 5,000 dòng.
- Dòng lỗi không được nhập, hiển thị số dòng và nội dung lỗi (có thể xuất CSV danh sách lỗi).
- Dòng thế hệ giá có thể xóa qua nhập (theo dạng của 28-183). Ngoài ra không xóa bằng CSV.
- Xuất và nhập CSV dùng cùng hạng mục・cùng kiểm tra như màn hình. Lịch sử thay đổi do nhập CSV được để lại là 「CSV取込」.

## 11. Quyền・lịch sử・kiểm tra

**Quyền** (`運営Web_権限表_20261003.md`): 「プラン管理」 (quản lý gói) thì quyền đầy đủ ＝ CRUD, các vai trò khác ＝ R. Quản lý hệ thống (vai trò sửa được việc cấp quyền) cũng CRUD.

**Lịch sử thay đổi**: ngày giờ thay đổi・nội dung thay đổi (tên hạng mục "trước thay đổi" → "sau thay đổi")・người thay đổi・loại thay đổi (nhập tay／nhập CSV). Cũng để lại việc thêm・đính chính thế hệ giá・chuyển đổi dùng để công khai.

**Kiểm tra (khi lưu)**

1. Mỗi course có đúng 1 dòng dùng để công khai.
2. Lite: giới hạn trên lạnh・thường ＝ tổng giới hạn cung cấp hằng tháng. Standard: giới hạn trên đông lạnh ＋ giới hạn trên lạnh・thường ≧ tổng.
3. Dưới ≦ trên (cho từng loại đông lạnh・lạnh・thường).
4. Số lần giao hàng tiêu chuẩn là số nguyên từ 1 trở lên.
5. Giá làm phí cơ bản (giá − phần doanh nghiệp chịu) dưới 0 yên thì không lưu được.
6. Các kỳ của thế hệ giá không chồng nhau.
7. Course máy bán hàng tự động: thiết bị có ít nhất 1 dòng máy bán hàng tự động, không có dòng tủ lạnh・tủ đông. Phương thức giao hàng của course máy bán hàng tự động chỉ là chuyến giao ES.
8. ID dòng máy của thiết bị tồn tại trong master dòng máy. Số máy là số nguyên từ 1 trở lên (tối đa 99).
9. Gói đang được dùng (có hợp đồng) thì không xóa được (chuyển sang không công khai). Thế hệ giá đang được dùng thì không xóa được, chỉ đính chính.

## 12. Điều kiện nghiệm thu

- [ ] Mỗi course trong 3 course giữ trực tiếp giá của mình (chuyến COOL／chuyến giao ES), không tính từ giá của course khác.
- [ ] Mỗi course chỉ có 1 dòng dùng để công khai. Không có 2 giá trị 「選択中」「公開用」 ở bất kỳ đâu trong dữ liệu・màn hình・CSV.
- [ ] Thêm thế hệ giá cũng không làm thay đổi số tiền của các hợp đồng con hiện có.
- [ ] Phần doanh nghiệp chịu (chưa thuế) được làm tròn, ví dụ (100×100÷1.08) ra 9,259 yên. UI・CSV・hóa đơn ra cùng giá trị.
- [ ] Tỷ lệ sắp hết có giá trị ban đầu 25%, thay đổi được từ màn hình theo gói ＋ course.
- [ ] Dòng thiết bị của gói chỉ có ID dòng máy・số máy・pattern, không lưu tên・dung tích・giá・thời hạn sử dụng tối thiểu của dòng máy vào gói.
- [ ] Nhập CSV không nhập dòng lỗi, hiển thị số dòng và nội dung lỗi.
- [ ] Theo đúng quyền, ngoài quyền đầy đủ thì chỉ xem. Lịch sử thay đổi để lại nhập tay／nhập CSV.

## 13. Code cần kiểm tra sau (PR này không sửa)

- Đổi `floor` của phần doanh nghiệp chịu (chưa thuế) → làm tròn (mọi chỗ ở UI・CSV・hóa đơn).
- Lưu・màn hình của `残りわずか率` và `利用人数目安`. Xóa các giá trị cố định trong code (ví dụ: quy tắc plan ≤ 100).
- Thay các bảng・hằng số cố định (số suất ăn, thiết bị, số lần giao hàng, giá) bằng tham chiếu master gói.
- Phép tính "giá Standard ＋ giảm giá chênh lệch" của Lite → giá trực tiếp theo từng course.
- Gộp 2 giá trị・nhãn 「選択中」 và 「公開用」 làm 1.
- Kiểm tra cách giữ cũ trong đó thế hệ giá là "1 giá cho mỗi course" (4b-9).
- Nút 「価格世代を一括切替」 (chuyển thế hệ giá hàng loạt) ở chi tiết master gói (đã quyết định chuyển sang phía hợp đồng).
- Phần còn sót của phí ban đầu (`initial_fee`) của course máy bán hàng tự động.
- Có sao chép thông tin dòng máy vào thiết bị cho mượn tiêu chuẩn hay không.
- UI・CSV・hóa đơn có dùng cùng hàm tính・cùng dữ liệu hay không.

## 14. Cần xác nhận (chưa quyết định. Không suy đoán)

- Giá trị chính thức của số lần giao hàng tiêu chuẩn của hàng đông lạnh (khác nhau theo gói. **Hiện tạm để 1 lần cho tất cả các gói** 〔trả lời của hong 2026-10-12〕. Cập nhật sau khi nhận bảng tủ đông).
- Số tiền chính thức của giá course máy bán hàng tự động (**hiện tạm để bằng với Lite tủ lạnh** 〔trả lời của hong 2026-10-12〕).
- Chi tiết gợi ý dựa trên số người sử dụng tham khảo: hiển thị ở màn hình nào (đăng ký／thay đổi gói／đơn hàng hằng tháng), cách đối chiếu với số người của khách hàng (trong phạm vi・khoảng・gần nhất), có làm hạng mục chỉ số hay không (hiện là chuỗi, ví dụ 「14名」), thời điểm phát hành.
