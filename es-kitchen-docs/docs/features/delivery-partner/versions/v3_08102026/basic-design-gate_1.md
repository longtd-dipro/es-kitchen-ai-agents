# Quality Gate O5 — Basic Design

- Workbook: `/Users/longtd/Desktop/WORK/Project Eskitchen/REQ/REQ_Công ty vận chuyển/Basic Design/Basic Design - Login.xlsx`
- Working sheets: 1 (OW_AUTH_001_Login)
- **15 checks · 15 PASS · 0 FAIL · 0 WARN**

| # | Check | Ket qua | Chi tiet |
|---|---|---|---|
| 1 | Sample immutable | PASS | Sample khong bi cham |
| 2 | Sheet Type = WORKING_SCREEN | PASS | 1 working sheet dung Sheet Type |
| 3 | Screen ID duy nhat | PASS | 1 Screen ID phan biet |
| 4 | Metadata F1..F5 day du | PASS | Moi working sheet du metadata |
| 5 | Screen Index dong bo | PASS | 1 sheet khop Screen Index |
| 6 | Message Code ton tai | PASS | 6 reference, tat ca deu co trong catalog |
| 7 | Change History co row moi | PASS | +1 row |
| 8 | Sheet ngoai scope khong doi | PASS | Khong sheet ngoai scope nao bi cham |
| 9 | Khop Screen Creation Plan | PASS | Dung 1 screen, THIEU: [] THUA: [] |
| 10 | Khai bao UI Source | PASS | Moi working sheet deu co anh UI |
| 11 | Khong con sheet vi du tu file mau | PASS | Khong co sheet vi du nao ngoai Screen Creation Plan |
| 12 | Change ID lien tuc | PASS | 6 row, CHG-0001..CHG-0006 lien tuc |
| 13 | Anh UI vua vung A-F | PASS | 1 anh, deu nam trong 840x900px (do bang anchor.ext — kich thuoc Excel thuc su render) |
| 14 | Style data row | PASS | 21 data row deu co duong ke va khong dung fill header |
| 15 | Bang ERROR SCENARIOS | PASS | 1 sheet, so row bang khop so error trong catalog |

**FAIL = 0 moi duoc bao Output 5 Done.** Khong duoc ha nguong gate.
