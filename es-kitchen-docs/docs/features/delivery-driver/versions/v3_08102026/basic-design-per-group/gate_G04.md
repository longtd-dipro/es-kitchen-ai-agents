# Quality Gate O5 — Basic Design

- Workbook: `/Users/longtd/Desktop/WORK/Project Eskitchen/REQ/REQ_Tài xế/basic-design/BD_04_Home.xlsx`
- Working sheets: 4 (DA_HOME_001_Home, DA_HOME_006_BlockToast, DA_HOME_007_EmptySOL, DA_HOME_008_EmptyDay)
- **15 checks · 14 PASS · 0 FAIL · 1 WARN**

| # | Check | Ket qua | Chi tiet |
|---|---|---|---|
| 1 | Sample immutable | PASS | Sample khong bi cham |
| 2 | Sheet Type = WORKING_SCREEN | PASS | 4 working sheet dung Sheet Type |
| 3 | Screen ID duy nhat | PASS | 4 Screen ID phan biet |
| 4 | Metadata F1..F5 day du | PASS | Moi working sheet du metadata |
| 5 | Screen Index dong bo | PASS | 4 sheet khop Screen Index |
| 6 | Message Code ton tai | PASS | 10 reference, tat ca deu co trong catalog |
| 7 | Change History co row moi | PASS | +1 row |
| 8 | Sheet ngoai scope khong doi | PASS | Khong sheet ngoai scope nao bi cham |
| 9 | Khop Screen Creation Plan | PASS | Dung 4 screen, THIEU: [] THUA: [] |
| 10 | Khai bao UI Source | WARN | 1 sheet chua co anh, da khai bao dung: DA_HOME_006_BlockToast |
| 11 | Khong con sheet vi du tu file mau | PASS | Khong co sheet vi du nao ngoai Screen Creation Plan |
| 12 | Change ID lien tuc | PASS | 6 row, CHG-0001..CHG-0006 lien tuc |
| 13 | Anh UI vua vung A-F | PASS | 5 anh, deu nam trong 840x900px (do bang anchor.ext — kich thuoc Excel thuc su render) |
| 14 | Style data row | PASS | 25 data row deu co duong ke va khong dung fill header |
| 15 | Bang ERROR SCENARIOS | PASS | 4 sheet, so row bang khop so error trong catalog |

**FAIL = 0 moi duoc bao Output 5 Done.** Khong duoc ha nguong gate.
