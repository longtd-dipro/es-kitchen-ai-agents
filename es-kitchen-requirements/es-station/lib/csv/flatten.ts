import type { DocRepo } from '@/lib/ops/core/area';
import { cellText } from './core';

/*
 * 出力だけの一覧（運営の配送一覧・請求書・申請…）の「システムにある全部の項目」の列。
 * 共通データ（dm.*）の1件を平らにして、見出しを日本語にし、ID の列には名前の列を足す（例：拠点ID・拠点名）。
 * 子の表（請求書の行など。いちばん初めの「オブジェクトの配列」）はキーをくり返した行にする（1-1・決定 2）。
 */

/** 項目のキー → 見出し（lib/domain/types.ts の項目） */
export const LABEL: Record<string, string> = {
  id: 'ID', name: '名前', kana: 'フリガナ', status: '状態', note: '備考', memo: 'メモ', reason: '理由', at: '日時', by: '操作した人',
  createdAt: '作成日時', createdBy: '作成者', updatedAt: '更新日時', updatedBy: '更新者', registeredAt: '登録日時', registeredOn: '登録日',
  corpId: '法人ID', branchId: '拠点ID', contractId: '親契約ID', childContractId: '子契約ID', cycleMonth: 'サイクル月', planId: 'プランID', course: 'コース',
  productId: '品番', productName: '商品名', itemId: '品目ID', item: '品目', warehouseId: '倉庫ID', hubId: '中継ID', carrierId: '配送会社ID', carrier2Id: '配送会社ID（区間2）',
  driverId: 'ドライバーID', supplierId: '仕入先ID', modelId: '機種ID', materialId: '資材ID', accountId: 'アカウントID', salesRepId: 'ES営業担当ID', agencyId: '代理店ID',
  feePlanId: '紹介フィープランID', taxRateId: '税率ID', userId: '利用者ID', applicationId: '申請ID', deliveryId: '配送ID', parentId: '親の配送ID', altId: '代替品設定ID',
  optionIds: 'オプションID', discountIds: '値引きID', branchIds: '拠点ID', poIds: '追加発注ID', menuId: 'メニュー',
  address: '住所', zip: '郵便番号', pref: '都道府県', city: '市区町村', addr1: '町名・番地', addr2: '建物等', tel: '電話番号', fax: 'FAX番号', email: 'メールアドレス',
  contractName: '法人名（契約）', billToName: '請求先法人名', billing: '請求', lead: '請求のリードタイム', invoiceUnit: '請求書の発行単位', payMethod: '支払方法',
  debitStatus: '口座振替の手続き', payCycle: '支払サイクル', dueRule: '入金期限', billonePayerId: 'Bill One 発行先ID',
  employees: '従業員数', originalStartOn: '当初契約開始日', receiveWindows: '受取できる時間帯', from: 'から', to: 'まで', deliveryNote: '設置場所・納品の条件',
  noStockCheck: '棚卸なし(1=なし)', kind: '種類', kindHistory: '契約種別の履歴', startCycle: '開始サイクル月', endOn: '終了日', billTo: '請求先',
  channels: '配送の流れ', temp: '温度帯', serviceForm: '配送区分', regime: '運び手', leadDays: '出荷からお届けの日数', slots: '枠', mealsPerDelivery: '1回の納品数',
  monthlyYen: '月額（税抜）', app: 'アプリ', allowCash: '現金利用(1=可)', allowGuest: 'ゲストモード(1=可)', allowEsqr: 'ES-QR(1=可)', dailyCapMeals: '1日上限数',
  billStatus: '請求の状態', gen: '生成方法', pricing: '価格と精算', mode: '方式', prices: '価格', fees: '費目', meals: '食数', lines: '明細', canceled: '取消',
  extras: 'ほかの請求', amountYen: '金額', taxRate: '税率', src: '元', refId: '元のID',
  slot: '枠', serviceDate: 'お届け日', shipOn: '出荷日', deliverOn: 'お届け日', plannedQty: '予定数', deliveredQty: '納品数', deliveredAt: '納品日時', completion: '完了の種類',
  destination: '届け先', windows: '時間帯', changeState: '日付変更', internalMemo: '運営メモ', shipRev: '出荷指示の版', feeBy: '配送費の負担', moveId: '移動ID',
  substitutedFrom: '元の商品', billPrice: '請求単価', legNo: '区間', isFinal: '最後の区間', assignScope: '割り当て', pickedUpAt: '受取日時', feeYen: '支払額',
  trackingNo: '送り状番号', boxNo: '箱番号', boxTotal: '箱数', typeId: '種類', reportedBy: '報告者', reportedAt: '報告日時', resolution: '対応', resolvedAt: '対応日時',
  childDeliveryId: '子の配送ID', requestedBy: '申請者', requestedAt: '申請日時', currentDate: 'いまの日付', wishDates: '希望日', proposedDate: '提案日', decidedAt: '決定日時',
  decisionReason: '決定の理由', declinedAt: '断った日', orderedAt: '注文日時', orderedBy: '注文者', dueOn: '期日', paid: '有料(1=有料)', qty: '数量',
  site: 'サイト', loginId: 'ログインID', roleIds: '役割', scope: '範囲', issuedAt: '発行日時', lastLoginAt: '最終ログイン',
  issueMonth: '発行月', issuedOn: '発行日', actualPeriod: '実績精算の期間', byRate: '税率ごと', subtotal: '小計（税抜）', tax: '消費税', subtotal10: '小計（10%）', subtotal8: '小計（8%）', carried: '繰越', tax10: '消費税（10%）', tax8: '消費税（8%）',
  total: '合計', carriedTo: '繰越先', send: '送付', method: '方法', fromInvoiceId: '元の請求書',
  type: '区分', kubun: '区分', companyName: '会社名', branchNames: '拠点名', request: '申請の中身', change: '変更の中身', results: '結果', result: '結果', proxy: '代理入力(1=代理)',
  orderCloseOn: 'オーダー締切日', startOn: '開始日', countFrom: '数え始める日', returnedOn: '回収日',
  /* 移行（受付簿 No.28） */
  source: 'データの出どころ', billingBlank: '空だった請求条件（要補完）', migration: '移行の記録', courseBlank: 'コースが空（既定にした）', courseDefault: '既定にしたコース', startOnBlank: '貸出日 未入力(1=推定)',
  deliveryCond: '納品の条件', ngDays: '納品不可曜日', shift: '納品不可になった場合', short: '消費期限の短い商品の扱い',
  photosBefore: '陳列前の写真', photosAfter: '陳列後の写真', stock: '在庫', inspection: '検品', cash: '集金', expectedYen: '集金予定額', collectedYen: '集金額',
  startedAt: '開始日時', completedAt: '完了日時', editableUntil: '修正の期限', earlyReason: '前倒しの理由', date: '日付', receiptFile: '領収書',
  decidedBy: '決定者', period: '締め月', checkedOn: '点検日', checkedBy: '点検者', rows: '明細', prev: '前回', delivered: '届けた数', disposed: '廃棄', actual: '実数', sold: '売れた数',
  arrived: '届いて数えた数', appSold: 'アプリの販売数', remaining: '残り',
  issuedOnCooler: '渡した日', category: 'カテゴリ', important: '重要(1=重要)', title: 'タイトル', body: '本文', publishFrom: '公開開始', publishTo: '公開終了', files: '添付',
  mail: 'メール', subject: '件名', sendAt: '送信日時', sendLog: '送信の記録', hubspotId: 'HubSpot の番号', channelsN: '通知の方法', templateId: 'メールの文面', readAt: '既読日時',
  nickname: 'ニックネーム', employeeNo: '従業員番号', link: '連携', limit: '購入制限', unitPriceYen: '単価', refundReason: '返金の理由', orderNo: '注文番号', comment: 'コメント',
  items: '商品', star: '評価', tags: 'タグ', code: 'コード', calc: '計算', amount: '金額', rate: '率', tiers: '段階', months: '月数', pay: '支払', updated: '更新日',
  linkedDiscounts: '連動する値引き', srcCorpId: '紹介元の法人ID', feePlan: '紹介フィープラン', cond: '条件', payStart: '支払開始年月', endPlan: '終了予定月', end: '終了月',
  history: '履歴', what: '内容', month: '対象年月', targetId: '支払先ID', paidOn: '支払日', base: '基準', branch: '枝番', split: '分割', regDate: '登録日', regAt: '登録日時',
  company: '会社', pic: '担当者', town: '町名', bld: '建物', deliv: 'お届け日', ship: '出荷日', why: '理由', ym: '年月', week: '出荷週', shipOrder: '出荷指示',
  poNo: '発注番号', part: '回', planQty: '予定数', planBox: '予定箱数', box: '箱数', receivedOn: '入荷日', bb: '消費期限', fix: '差異の対応',
  priceYen: '販売価格（税込）', jan: 'JANコード', public: '公開(1=公開)', minMonths: '最低利用期間', recoveryYen: '回収額', feeType: '料金種別', target: '適用対象', rule: '引き方',
  thomasCode: 'THOMAS倉庫コード', branchCode: '営業所コード', areas: '対応エリア', weekdays: '対応曜日', temps: '温度帯', feePerDelivery: '1件の支払額', trackingUrl: '追跡URL',
  employment: '雇用', label: '表示', order: '表示順', img: '画像', quote: '見積', answerBy: '回答期限', responses: '回答', deliveriesPerMonth: '月の配送回数',
  wishWeekdays: '希望曜日', corpName: '法人名', weekend: '土日対応', planName: 'プラン', vending: '自販機', priceCond: '金額条件', moreSites: 'まとめて聞く拠点', decidedCarrierId: '決定した配送会社ID', foundOn: '発覚日', altProductId: '代替商品', lotNo: 'ロット', lotAction: 'ロットの扱い', createPo: '追加発注(1=する)',
  warnings: '警告', shortage: '不足', claimId: '仕入先への請求ID', disposals: '廃棄', notify: '通知(1=する)', whenDate: '日付', when: '届ける便', comp: '既納品分', publishOn: '公開日',
  orderFrom: '受付開始', orderTo: '受付終了', corpPublish: '法人への公開', autoPublishOn: '自動公開日', pdfs: 'メニューPDF', publishedAt: '公開日時', log: '変更履歴',
  qtyN: '数', approvedAt: '承認日時', approvedBy: '承認者', sites: 'サイト', cidr: 'IPアドレス', os: 'OS', version: 'バージョン', force: '強制(1=強制)', perms: '権限',
  minQty: 'しきい値', on: '日付', total2: '合計', moveKind: '種類', processed: '処理済', summary: '集計', finishedAt: '完了日時', fromCycle: '適用開始', planIdBulk: 'プランID',
  contractIds: '親契約ID', notifyCorp: '法人へ通知(1=する)', confirmed: '確認', trouble: 'トラブル(1=トラブル)', phase: '時期', warningsN: '警告',
  /* 発注（仕入先サイト・運営の発注。lib/supplier/types の Order） */
  sup: '仕入先ID', pid: '品番', wh: '納入倉庫', kari: '仮発注数', hon: '本発注数', unit: '単位', ans: '回答の状態', parts: '出荷の回', honAck: '本発注の承認(1=承認)',
  honAt: '本発注日時', honAckAt: '本発注の承認日時', recv: '入荷', recvDate: '入荷日', lot: '入り数', seen: '既読(1=既読)', re: '数量変更', add: '追加発注',
  wishBB: '希望の消費期限', eta: '出荷予定日', slip: '送り状番号', unitCostYen: '仕入単価（税抜）', dlv: '納品日', wish: '入荷希望日', deliver: 'お届け日', st: '状態',
  reject: '受注不可', cancel: 'キャンセル', hist: '履歴', carrier: '運送会社',
};

/** ID の項目 → 名前を引く文書の種類（名前の列を右に足す） */
const NAME_OF: Record<string, { kind: string; field?: string; label: string }> = {
  corpId: { kind: 'dm.org.corps', label: '法人名' }, srcCorpId: { kind: 'dm.org.corps', label: '紹介元の法人名' },
  branchId: { kind: 'dm.org.branches', label: '拠点名' }, branchIds: { kind: 'dm.org.branches', label: '拠点名' },
  productId: { kind: 'dm.master.products', label: '商品名' }, altProductId: { kind: 'dm.master.products', label: '代替商品名' }, substitutedFrom: { kind: 'dm.master.products', label: '元の商品名' },
  warehouseId: { kind: 'dm.master.warehouses', label: '倉庫名' }, hubId: { kind: 'dm.master.warehouses', label: '中継名' },
  carrierId: { kind: 'dm.master.carriers', label: '配送会社名' }, carrier2Id: { kind: 'dm.master.carriers', label: '配送会社名（区間2）' }, decidedCarrierId: { kind: 'dm.master.carriers', label: '決定した配送会社名' },
  driverId: { kind: 'dm.master.drivers', label: 'ドライバー名' }, planId: { kind: 'dm.master.plans', label: 'プラン名' }, modelId: { kind: 'dm.master.models', label: '機種名' },
  materialId: { kind: 'dm.master.materials', label: '資材名' }, supplierId: { kind: 'dm.account.accounts', label: '仕入先名' }, salesRepId: { kind: 'dm.account.accounts', label: 'ES営業担当' },
  sup: { kind: 'dm.account.accounts', label: '仕入先名' }, pid: { kind: 'dm.master.products', label: '商品名' },
  accountId: { kind: 'dm.account.accounts', label: 'アカウント名' }, agencyId: { kind: 'dm.org.agencies', label: '代理店名' }, feePlanId: { kind: 'dm.referral.feePlans', label: '紹介フィープラン名' },
  taxRateId: { kind: 'dm.master.taxRates', field: 'label', label: '税率' }, userId: { kind: 'dm.app.users', label: '利用者名' },
  optionIds: { kind: 'dm.master.options', label: 'オプション名' }, discountIds: { kind: 'dm.master.discounts', label: '値引き名' },
  itemId: { kind: 'dm.master.products', label: '品目名' },
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const isObjArr = (v: unknown): v is Record<string, unknown>[] => Array.isArray(v) && v.length > 0 && v.every(isObj);

type Flat = Map<string, string>;

/** 1件を平らにする（子の表の配列は外して返す） */
function flatOne(r: DocRepo, rec: Record<string, unknown>, childKey: string | null, prefix = ''): Flat {
  const out: Flat = new Map();
  const name = (k: string, v: unknown) => {
    const n = NAME_OF[k];
    if (!n) return undefined;
    const one = (id: string) => {
      if (!id) return '';
      if ((k === 'itemId' || k === 'pid') && /^S\d+/.test(id)) return r.get<{ name: string }>('dm.master.materials', id)?.name ?? '';
      const x = r.get<Record<string, unknown>>(n.kind, id);
      return x ? String(x[n.field ?? 'name'] ?? '') : '';
    };
    return Array.isArray(v) ? v.map((x) => one(String(x))).filter(Boolean).join(';') : typeof v === 'string' ? one(v) : undefined;
  };
  for (const [k, v] of Object.entries(rec)) {
    if (k === childKey && !prefix) continue;
    if (k.startsWith('_')) continue;
    const label = prefix + (LABEL[k] ?? k);
    if (isObj(v)) { for (const [kk, vv] of flatOne(r, v, null, label + '_')) out.set(kk, vv); continue; }
    if (isObjArr(v)) { out.set(label, v.map((o) => Object.entries(o).map(([a, b]) => `${LABEL[a] ?? a}=${cellText(b)}`).join(' ')).join(';')); continue; }
    out.set(label, cellText(v));
    const nm = name(k, v);
    if (nm !== undefined) out.set(prefix + NAME_OF[k].label, nm);
  }
  return out;
}

/**
 * 文書（dm.*）を平らにした表。childKey＝子の表にする配列の項目（省くと、いちばん初めのオブジェクトの配列）。
 * 返り値：見出しと、1件ごとの行（子の表は親の項目をくり返した行）
 */
export function flattenDocs(r: DocRepo, recs: Record<string, unknown>[], childKey?: string | null) {
  const ck = childKey === undefined ? (recs.length ? Object.keys(recs[0]).find((k) => recs.some((x) => isObjArr(x[k]))) ?? null : null) : childKey;
  const head: string[] = [];
  const add = (k: string) => { if (!head.includes(k)) head.push(k); };
  const groups: Flat[][] = [];
  for (const rec of recs) {
    const base = flatOne(r, rec, ck);
    for (const k of base.keys()) add(k);
    const kids = ck && isObjArr(rec[ck]) ? (rec[ck] as Record<string, unknown>[]) : [];
    if (!kids.length) { groups.push([base]); continue; }
    groups.push(kids.map((kid) => {
      const f = flatOne(r, kid, null, (LABEL[ck!] ?? ck) + '_');
      for (const k of f.keys()) add(k);
      return new Map([...base, ...f]);
    }));
  }
  /* groups＝1件ごとの行（子の表があれば複数） */
  return { head, groups: groups.map((g) => g.map((f) => head.map((h) => f.get(h) ?? ''))) };
}
