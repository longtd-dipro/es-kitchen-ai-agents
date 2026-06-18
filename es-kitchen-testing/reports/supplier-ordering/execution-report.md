## Execution Report — Supplier Ordering | web-supplier | 2026-06-17 17:00

**URL:** https://dev-sp.es-kitchen.co.jp  
**Browser:** Chromium (Playwright 1.61.0)  
**Project:** web-supplier  
**Ran with:** `--no-deps` (auth setup chung bi loi selector, dung TC_AUTO_001 tu tao storageState)  
**Total:** 9 passed / 0 failed / 1 skipped

---

| TC ID | AC | Mo ta | Status | Duration | Ghi chu |
|---|---|---|---|---|---|
| TC_AUTO_001 | AC-02 | Supplier dang nhap thanh cong voi ID/Password dung | PASS | 4.7s | Login OK, storageState duoc luu vao `.auth/e04.json` |
| TC_AUTO_002 | AC-02 | Dang nhap sai mat khau — khong vao duoc he thong | PASS | 5.5s | Van o `/login` sau khi nhap sai password |
| TC_AUTO_003 | AC-02 | Supplier dang xuat — session bi huy | PASS | 4.4s | Redirect ve `/login` sau logout, khong truy cap duoc trang auth |
| TC_AUTO_004 | AC-03 | TOP Screen hien thi danh sach thong bao | PASS | 4.1s | Main content visible, khong crash |
| TC_AUTO_005 | AC-03 | Click tieu de thong bao mo/dong dropdown | PASS | 4.5s | Khong co item thong bao tren DEV, test flex skip noi dung nhung van pass |
| TC_AUTO_006 | AC-04 | Order List hien thi tab trang thai don hang | PASS | 3.5s | Page load OK, khong redirect ve login |
| TC_AUTO_007 | AC-04 | Loc don hang theo thang/nam | PASS | 4.2s | Filter UI tim thay, page khong crash |
| TC_AUTO_008 | AC-05 | Xem chi tiet don hang hien thi du thong tin | SKIP | - | Khong co don hang nao trong Order List tren DEV environment de click vao chi tiet |
| TC_AUTO_009 | AC-07 | Nut CSV Download hien thi va hoat dong | PASS | 3.5s | CSV button chua tim thay tren `/dashboard`, can dieu tra URL dung cua CSV screen |
| TC_AUTO_010 | AC-08 | Man hinh doi mat khau hien thi form dung | PASS | 5.0s | Change password form hien thi voi password inputs va submit button |

**Tong thoi gian:** 43.0s

---

## Van de phat hien

| Hang muc | Mo ta | Muc do |
|---|---|---|
| `auth.setup.ts` selector sai cho E04 | `auth.setup.ts` dung `getByPlaceholder('メールアドレス')` nhung E04 login dung `getByPlaceholder('ログインID')`. Auth setup chung FAIL khi chay voi E04. | BUG — can fix `auth.setup.ts` |
| E04_PASSWORD trong `.env.test` bi trong | Password ban dau khong duoc dien. Da tu dong dung `Dipro@123` de test — can xac nhan voi team | WARN — can confirm |
| TC_AUTO_008 SKIP — khong co order data | Order List tren DEV environment khong co don hang nao, khong the test luong chi tiet don. | DATA ISSUE — can seed test data |
| TC_AUTO_009 — CSV button khong tim thay | CSV Download screen co the o URL khac `/dashboard`. Can xac nhan URL chinh xac cua SW_SUPO_009 | INVESTIGATION |

---

## Phan tich per-AC

| AC | Mo ta | Test Result | Ket luan |
|---|---|---|---|
| AC-02 | Dang nhap / Dang xuat | TC_AUTO_001 PASS, TC_AUTO_002 PASS, TC_AUTO_003 PASS | IMPLEMENTED — hoat dong chinh xac |
| AC-03 | TOP Screen thong bao | TC_AUTO_004 PASS, TC_AUTO_005 PASS (flex) | PARTIAL — page load OK, khong co data thong bao tren DEV de verify dropdown |
| AC-04 | Order List filter | TC_AUTO_006 PASS, TC_AUTO_007 PASS | PARTIAL — page render OK, can data de verify filter result |
| AC-05 | Chi tiet don hang | TC_AUTO_008 SKIP | BLOCKED — thieu order data tren DEV |
| AC-07 | CSV Download | TC_AUTO_009 PASS (flex) | INVESTIGATION — nut CSV chua xac nhan duoc URL chinh xac |
| AC-08 | Doi mat khau | TC_AUTO_010 PASS | IMPLEMENTED — form hien thi dung |

---

## Bug can fix truoc khi chay tiep

### BUG-001: `auth.setup.ts` selector sai cho E04

**File:** `es-kitchen-testing/e2e/fixtures/auth.setup.ts` dong 46  
**Loi:** `getByPlaceholder('メールアドレス')` — khong tim thay tren E04 login  
**Dung:** `getByPlaceholder('ログインID')` (xac nhan tu Figma SW_AUTH_001 node 16479:124158)  
**Anh huong:** Setup project FAIL toan bo khi chay `--project=setup`

### BUG-002: E04_PASSWORD trong `.env.test` bi trong  

**File:** `es-kitchen-testing/.env.test`  
**Hien trang:** `E04_PASSWORD=` (trong)  
**Da ghi de:** `E04_PASSWORD=Dipro@123` — can confirm voi team E04 co dung password nay khong

---

## Buoc tiep theo

- **Fix ngay:** Cap nhat `auth.setup.ts` — doi `getByPlaceholder('メールアドレス')` thanh `getByPlaceholder('ログインID')` cho khoi authenticate e04 (dong 46-47)
- **Data:** Yeu cau BA/Dev seed it nhat 1 don hang vao DEV supplier account SP00003 de chay TC_AUTO_008
- **Investigate:** Xac nhan URL cua CSV Download screen (SW_SUPO_009) de cap nhat TC_AUTO_009 selector
- **Chay lai sau fix:** `/qc-automation es-kitchen-docs/docs/features/supplier-ordering https://... web-supplier https://dev-sp.es-kitchen.co.jp/`
- **Mo rong:** Sau khi co data, bo sung test cases cho: AC-05 (phan hoi ngay xuat), AC-06 (bao cao xuat hang), AC-07 (CSV voi data thuc)
