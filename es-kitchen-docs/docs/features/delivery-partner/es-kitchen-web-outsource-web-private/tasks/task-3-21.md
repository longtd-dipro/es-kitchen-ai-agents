# [FE] [Delivery_Web] — Modal アカウント一括発行: kết quả thành công / lỗi một phần + 再度実行

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送スタッフ
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 7h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | task-3-20 |
| Song song với | task-3-22 |
| Estimate | ~7h |

## Mục tiêu
Hai màn kết quả của modal: thành công toàn bộ và **lỗi một phần** với danh sách dòng lỗi + nút `再度実行` chỉ chạy lại các dòng thất bại.

## Context (đọc trước khi code)
- **Figma:** node **`31498:194129`** — frame kết quả ✅ và frame ⚠️ `一部エラーあり` (có nút `完了` / `再度実行`)
- **Design-Technical.md (FE)** → FE-08, §7.1 bước 4–6
- **BE task:** `task-2-9.md` → `results[]` với `errorCode` / `errorMessage`

## API Definition
```
results: Array<{ driverId, driverCode, driverName, email,
                 status: 'SUCCESS' | 'FAILED',
                 errorCode: 'EMAIL_MISSING'|'ALREADY_ISSUED'|'COGNITO_ERROR'|'MAIL_SEND_FAILED'|'DRIVER_INACTIVE'|null,
                 errorMessage: string | null }>
```

## Yêu cầu implement

### Step 3 — `BulkIssueAccountModal.tsx`
- `failed === 0` → state `success`: icon ✅, `アカウント発行が完了しました`, mô tả, nút `完了`
- `failed > 0` → state `partialError`: icon ⚠️, `アカウント発行が完了しました（一部エラーあり）`, dòng `エラー：〇〇件`, bảng highlight dòng lỗi kèm `errorMessage` từ API, nút `完了` + **`再度実行`**
- `再度実行` → mutate lại với `driverIds = results.filter(r => r.status === 'FAILED').map(r => r.driverId)` → quay lại state `loading`
- `完了` → đóng modal, clear `selectedRowKeys`, `invalidateQueries(['drivers'])`
- **Hiển thị `errorMessage` do BE trả** — không tự dịch/ghép câu tiếng Nhật ở FE

## Unit Tests (BẮT BUỘC)
```typescript
it('shows the success screen when failed = 0', ...);
it('shows the partial error screen with the failed count', ...);
it('retries only the failed driver ids', ...);
it('renders the errorMessage returned by the API', ...);
it('clears the selection and refetches the list on 完了', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage BulkIssueAccountModal`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Chọn 1 nhân viên **không có email** + 1 nhân viên hợp lệ → màn lỗi một phần hiện đúng 1 dòng lỗi
- [ ] Bổ sung email rồi bấm `再度実行` → dòng đó chuyển thành công
- [ ] `完了` → danh sách cập nhật `発行済み`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Bước xác nhận (task-3-20) | `BulkIssueAccountModal.tsx` | Test suite task-3-20 pass |
| Danh sách nhân viên | `EmployeePage.tsx` | Cột `アカウント状態` cập nhật sau khi đóng modal |

## Không được làm
- Không tự sinh nội dung lỗi tiếng Nhật ở FE
- Không gửi lại toàn bộ danh sách khi bấm `再度実行`
- Không đóng modal tự động khi có dòng lỗi

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
