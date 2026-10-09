import type { Cooler, Quote } from '../types';

/*
 * 委託配送先の見本：保冷バッグの台帳（運営の lib/ops/general/seed.ts GEN_COOLER と同じ）・見積。
 * 見積は共通データの新規申込（AP-…）に付けた：みなと物流 横浜倉庫（決定）・ひかり物産 横浜オフィス（回答中）・みらい商事 京都支店（依頼中）
 */

export const COOLERS: Cooler[] = [
  { id: 'CB-0001', kind: '保冷バッグ', qty: 2, carrierId: 'DE00001', pref: '神奈川県', driverId: 'DR00011', issuedOn: '2026/04/01', status: '貸与中', memo: '' },
  { id: 'CB-0002', kind: '保冷剤', qty: 10, carrierId: 'DE00001', pref: '神奈川県', driverId: 'DR00011', issuedOn: '2026/04/01', status: '貸与中', memo: '一部返却（傷み）', returnedOn: '2026/08/20', returnedQty: 2 },
  { id: 'CB-0003', kind: '保冷バッグ', qty: 1, carrierId: 'DE00001', pref: '東京都', driverId: 'DR00014', issuedOn: '2026/05/12', status: '紛失', memo: '2026/09 紛失の連絡。新しい CB-0007 を渡した' },
  { id: 'CB-0004', kind: '保冷バッグ', qty: 3, carrierId: 'DE00006', pref: '大阪府', driverId: 'DR00041', issuedOn: '2026/09/28', status: '貸与中', memo: 'みどり便の開始時に渡した' },
  { id: 'CB-0005', kind: '保冷剤', qty: 12, carrierId: 'DE00006', pref: '大阪府', driverId: 'DR00041', issuedOn: '2026/09/28', status: '貸与中', memo: '' },
  { id: 'CB-0006', kind: '保冷バッグ', qty: 1, carrierId: 'DE00007', pref: '千葉県', driverId: 'DR00045', issuedOn: '2026/08/03', status: '貸与中', memo: '個人の業者（スタッフ1名）' },
  { id: 'CB-0007', kind: '保冷バッグ', qty: 1, carrierId: 'DE00001', pref: '東京都', driverId: 'DR00014', issuedOn: '2026/09/18', status: '貸与中', memo: '' },
  { id: 'CB-0008', kind: '保冷剤', qty: 4, carrierId: 'DE00007', pref: '千葉県', driverId: 'DR00045', issuedOn: '2026/08/03', status: '廃棄', memo: '破れのため廃棄（回収なし）', returnedOn: '2026/09/15', returnedQty: 0 },
  { id: 'CB-0009', kind: '保冷剤', qty: 6, carrierId: 'DE00001', pref: '神奈川県', driverId: 'DR00011', issuedOn: '2026/06/01', status: '貸与中', memo: '夏の増量分。9月に半分返却', returnedOn: '2026/09/30', returnedQty: 3 },
];

const addr = (pref: string, city: string, addr1 = '') => ({ zip: '', pref, city, addr1, addr2: '' });

export const QUOTES: Quote[] = [
  { id: 'QT-2026-0929-017', applicationId: 'AP-20261001-0066', branchName: '株式会社みなと物流 横浜倉庫', address: addr('神奈川県', '横浜市鶴見区', '大黒町1-1'), temp: '冷蔵',
    deliveriesPerMonth: 2, mealsPerDelivery: 25, wishWeekdays: '火・木', requestedAt: '2026/09/29 10:00', requestedBy: 'Ad00011', answerBy: '2026/10/03',
    responses: [
      { carrierId: 'DE00001', status: '回答済', feeYen: 2000, weekdays: '月〜土', startCycle: '2026-11', note: '川崎デポから当日配送できます', answeredAt: '2026/09/30 15:20' },
      { carrierId: 'DE00007', status: '辞退', feeYen: 0, weekdays: '', startCycle: '', note: '鶴見区は対応エリア外', answeredAt: '2026/09/30 09:05' },
    ], status: '決定', decidedCarrierId: 'DE00001' },
  { id: 'QT-2026-1002-019', applicationId: 'AP-20260922-0057', branchName: '株式会社ひかり物産 横浜オフィス', address: addr('神奈川県', '横浜市西区', 'みなとみらい2-2'), temp: '冷蔵',
    deliveriesPerMonth: 2, mealsPerDelivery: 25, wishWeekdays: '水', requestedAt: '2026/10/02 11:00', requestedBy: 'Ad00011', answerBy: '2026/10/07',
    responses: [
      { carrierId: 'DE00001', status: '回答済', feeYen: 2200, weekdays: '月〜土', startCycle: '2026-11', note: '自販機の補充も可', answeredAt: '2026/10/03 17:40' },
      { carrierId: 'DE00007', status: '回答待ち', feeYen: 0, weekdays: '', startCycle: '', note: '', answeredAt: '' },
    ], status: '依頼中', decidedCarrierId: '' },
  { id: 'QT-2026-1005-021', applicationId: 'AP-20261005-0071', branchName: '株式会社みらい商事 京都支店', address: addr('京都府', '京都市下京区', '烏丸通1-1'), temp: '冷蔵',
    deliveriesPerMonth: 2, mealsPerDelivery: 25, wishWeekdays: '火・金', requestedAt: '2026/10/05 09:30', requestedBy: 'Ad00011', answerBy: '2026/10/09',
    responses: [{ carrierId: 'DE00006', status: '回答待ち', feeYen: 0, weekdays: '', startCycle: '', note: '', answeredAt: '' }], status: '依頼中', decidedCarrierId: '' },
];
