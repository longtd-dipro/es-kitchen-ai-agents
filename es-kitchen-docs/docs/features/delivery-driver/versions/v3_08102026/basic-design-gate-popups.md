# Quality Gate O5 — Basic Design

- Workbook: `/Users/longtd/Desktop/WORK/Project Eskitchen/REQ/REQ_Tài xế/basic-design/delivery-driver_basic-design.xlsx`
- Working sheets: 36 (DA_AUTHEN_001_Login, DA_AUTHEN_002_01_Reset1, DA_AUTHEN_002_02_Reset2, DA_AUTHEN_002_04_Reset3, DA_AUTHEN_002_06_ResetDone, DA_HOME_005_MyPage, DA_HOME_001_Home, DA_NOTI_001_NotiList, DA_NOTI_002_NotiDetail, DA_LIST_001_Kho_ListKho, DA_LIST_002_ES_ListES, DA_LIST_003_COOL_ListDone, DA_RECV_001_RecvEdit, DA_RECV_003_RecvView, E-02_RecvPartial, E-03_RecvDiscard, DA_ESDL_000_0_ESToday, DA_ESDL_000_1_ESFuture, DA_ESDL_000_2_ESDone, DA_ESDL_001_ESStep1, DA_ESDL_002_Step2Stock, E-08_ScanStep2, DA_ESDL_002-05_Step2Result, DA_ESDL_003_Step3Insp, E-10_ScanStep3, E-11_DiffConfirm, DA_ESDL_003-06_Step3Result, DA_ESDL_004_Step4Photo, DA_ESDL_005_Step5Collect, DA_ESDL_006_AfterDone, DA_COOL_001_COOLDetail, E-13_CoolPartial, DA_RPTD_001_TroubleSel, DA_RPTD_002_TroubleDtl, E-17_SendConfirm, E-16_CallES)
- **15 checks · 15 PASS · 0 FAIL · 0 WARN**

| # | Check | Ket qua | Chi tiet |
|---|---|---|---|
| 1 | Sample immutable | PASS | Sample khong bi cham |
| 2 | Sheet Type = WORKING_SCREEN | PASS | 36 working sheet dung Sheet Type |
| 3 | Screen ID duy nhat | PASS | 36 Screen ID phan biet |
| 4 | Metadata F1..F5 day du | PASS | Moi working sheet du metadata |
| 5 | Screen Index dong bo | PASS | 36 sheet khop Screen Index |
| 6 | Message Code ton tai | PASS | 172 reference, tat ca deu co trong catalog |
| 7 | Change History co row moi | PASS | +1 row |
| 8 | Sheet ngoai scope khong doi | PASS | Khong sheet ngoai scope nao bi cham |
| 9 | Khop Screen Creation Plan | PASS | Dung 36 screen, THIEU: [] THUA: [] |
| 10 | Khai bao UI Source | PASS | Moi working sheet deu co anh UI |
| 11 | Khong con sheet vi du tu file mau | PASS | Khong co sheet vi du nao ngoai Screen Creation Plan |
| 12 | Change ID lien tuc | PASS | 8 row, CHG-0001..CHG-0008 lien tuc |
| 13 | Anh UI vua vung A-F | PASS | 36 anh, deu nam trong 840x900px (do bang anchor.ext — kich thuoc Excel thuc su render) |
| 14 | Style data row | PASS | 122 data row deu co duong ke va khong dung fill header |
| 15 | Bang ERROR SCENARIOS | PASS | 36 sheet, so row bang khop so error trong catalog |

**FAIL = 0 moi duoc bao Output 5 Done.** Khong duoc ha nguong gate.
