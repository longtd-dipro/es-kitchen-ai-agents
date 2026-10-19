# Quality Gate O5 — Basic Design

- Workbook: `/Users/longtd/Desktop/WORK/Project Eskitchen/REQ/REQ_Công ty vận chuyển/Basic Design - Công ty vận chuyển.xlsx`
- Working sheets: 19 (OW_AUTH_001_Login, OW_AUTH_002_PwReset, OW_AUTH_003_Register1, OW_AUTH_004_Register2, OW_AUTH_005_Registered, OW_HOME_001_Home, OW_ANNO_002_NoticeDetail, OW_SCHD_001_ScheduleMonth, OW_SCHD_002_ScheduleWeek, OW_DLVR_001_DeliveryList, OW_DLVR_002_DeliveryDetail, OW_DLVR_003_FileViewer, OW_CLCT_001_Collection, OW_STAF_001_StaffList, OW_STAF_003_StaffDetail, OW_STAF_004_StaffForm, OW_STAF_005_BulkIssue, OW_PROF_001_ProfileBasic, OW_PROF_002_ProfileDelivery)
- **15 checks · 14 PASS · 0 FAIL · 1 WARN**

| # | Check | Ket qua | Chi tiet |
|---|---|---|---|
| 1 | Sample immutable | PASS | Sample khong bi cham |
| 2 | Sheet Type = WORKING_SCREEN | PASS | 19 working sheet dung Sheet Type |
| 3 | Screen ID duy nhat | PASS | 19 Screen ID phan biet |
| 4 | Metadata F1..F5 day du | PASS | Moi working sheet du metadata |
| 5 | Screen Index dong bo | PASS | 19 sheet khop Screen Index |
| 6 | Message Code ton tai | PASS | 138 reference, tat ca deu co trong catalog |
| 7 | Change History co row moi | PASS | +1 row |
| 8 | Sheet ngoai scope khong doi | PASS | Khong sheet ngoai scope nao bi cham |
| 9 | Khop Screen Creation Plan | PASS | Dung 19 screen, THIEU: [] THUA: [] |
| 10 | Khai bao UI Source | WARN | 1 sheet chua co anh, da khai bao dung: OW_AUTH_005_Registered |
| 11 | Khong con sheet vi du tu file mau | PASS | Khong co sheet vi du nao ngoai Screen Creation Plan |
| 12 | Change ID lien tuc | PASS | 6 row, CHG-0001..CHG-0006 lien tuc |
| 13 | Anh UI vua vung A-F | PASS | 36 anh, deu nam trong 840x900px (do bang anchor.ext — kich thuoc Excel thuc su render) |
| 14 | Style data row | PASS | 171 data row deu co duong ke va khong dung fill header |
| 15 | Bang ERROR SCENARIOS | PASS | 19 sheet, so row bang khop so error trong catalog |

**FAIL = 0 moi duoc bao Output 5 Done.** Khong duoc ha nguong gate.
