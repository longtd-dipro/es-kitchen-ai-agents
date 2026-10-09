import type { Application } from '../types';
import type { InfoEdits } from '../areas/apply';

/*
 * 申請の見本。運営の契約申請管理（lib/ops/applications/data/applications.json）と同じ番号・中身。
 * 運営の見本の「東京フードサービス・大阪キッチン」の申請は、ほかの見本と ID が食い違う（CU00002・CU00003 がデモごとに別の会社）ため、
 * 中身はそのままで共通データの拠点に付け替えた：
 *   CH-20260922-0001 配送の変更 → ひかり物産 川崎工場／CH-20260923-0001 設備の変更 → ことぶき商会 本店
 *   CH-20260924-0001 拠点情報の変更 → ことぶき商会 横浜倉庫／CH-20260926-0001 休止 → ひかり物産 本社
 *   CH-20260927-0001 再開 → サンプル 名古屋営業所／CH-20260927-0002 解約 → カフェ花 横浜店（承認済み）
 */

type R = Application['results'][number];
const wait = (...ids: string[]): R[] => ids.map((branchId) => ({ branchId, result: '', reason: '', by: '', at: '' }));
const ok = (at: string, by: string, ...ids: string[]): R[] => ids.map((branchId) => ({ branchId, result: 'ok', reason: '', by, at }));

const ch = (a: Omit<Application, 'type' | 'kubun' | 'branchNames' | 'proxy' | 'reason' | 'change'> & Partial<Application>): Application => ({
  type: 'change', kubun: '', branchNames: [], proxy: false, reason: '', change: {}, ...a,
});
const ap = (a: Omit<Application, 'type' | 'kind' | 'results' | 'change' | 'proxy' | 'reason' | 'orderCloseOn'> & Partial<Application>): Application => ({
  type: 'new', kind: '新規申込', results: [], change: {}, proxy: false, reason: '', orderCloseOn: '', ...a,
});

/** 拠点情報の変更・法人情報の変更の見本に、承認で直す欄（edits）を付ける（法人Web から出した申請と同じ形） */
const withEdits = (a: Application, edits: InfoEdits): Application => ({ ...a, edits } as Application);

export const APPLICATIONS: Application[] = [
  /* ===== 変更申請 ===== */
  ch({ id: 'CH-20260925-0001', kind: 'プランの変更', status: '承認待ち', corpId: 'CU00001', companyName: '株式会社サンプル', branchIds: ['CU00871'],
    requestedBy: { site: 'corp', accountId: 'CU00871', name: '中村 里奈（拠点アカウント）' }, requestedAt: '2026/09/25 10:30', startCycle: '2026-11', orderCloseOn: '2026/10/15',
    request: [['変更したいこと', 'プランの変更（増量・冷凍の追加）'], ['変更後のプラン', 'ES000004　100プラン（ESスタンダード）'], ['開始したいサイクル月', '2026年11月サイクル'], ['理由', '10月からの増員で提供数が不足するため。冷凍のメニューも使いたい']],
    change: { planId: 'ES000004', course: 'ESスタンダード' }, results: wait('CU00871') }),
  withEdits(ch({ id: 'CH-20260929-0001', kind: '法人情報の変更', status: '承認待ち', corpId: 'CU00001', companyName: '株式会社サンプル', branchIds: [],
    requestedBy: { site: 'corp', accountId: 'CU00001', name: '高橋 由紀（法人アカウント）' }, requestedAt: '2026/09/29 14:05', startCycle: '', orderCloseOn: '',
    request: [['変更したいこと', '請求書に載る電話番号・FAX番号'], ['変更後', '電話 03-5401-2300／FAX 03-5401-2301'], ['反映', '承認後すぐ（未発行の請求書から）'], ['理由', '代表番号の変更のため']],
    results: wait('CU00001') }),
    /* 承認で直す欄（M3：承認で法人の電話・FAX が変わる） */
    { tel: '03-5401-2300', fax: '03-5401-2301' }),
  ch({ id: 'CH-20260922-0001', kind: '配送の変更', status: '承認待ち', corpId: 'CU00031', companyName: '株式会社ひかり物産', branchIds: ['CU01902'],
    requestedBy: { site: 'corp', accountId: 'CU00031', name: '光岡 舞（法人アカウント）' }, requestedAt: '2026/09/22 11:00', startCycle: '2026-11', orderCloseOn: '2026/10/15',
    request: [['変更したいこと', '納品不可曜日（プラン・オプションは変えない）'], ['開始したいサイクル月', '2026年11月サイクル'], ['ご要望', '川崎工場は月曜の受け取りができなくなった']],
    results: wait('CU01902') }),
  ch({ id: 'CH-20260923-0001', kind: '設備の変更', status: '承認待ち', corpId: 'CU00044', companyName: '株式会社ことぶき商会', branchIds: ['CU01903'],
    requestedBy: { site: 'corp', accountId: 'CU00044', name: '寿 一郎（法人アカウント）' }, requestedAt: '2026/09/23 09:40', startCycle: '2026-11', orderCloseOn: '2026/10/15',
    request: [['変更したいこと', '冷蔵庫のサイズ変更・電子レンジの追加'], ['開始したいサイクル月', '2026年11月サイクル'], ['設置・回収の配送', '希望する（金額は運営が入れる）'], ['理由', '在庫切れが増えたため冷蔵庫を大きくしたい。温め待ちの行列ができるので電子レンジをもう1台']],
    results: wait('CU01903') }),
  withEdits(ch({ id: 'CH-20260924-0001', kind: '拠点情報の変更', status: '承認待ち', corpId: 'CU00044', companyName: '株式会社ことぶき商会', branchIds: ['CU01904'],
    requestedBy: { site: 'corp', accountId: 'CU00044', name: '寿 一郎（法人アカウント）' }, requestedAt: '2026/09/24 15:20', startCycle: '2026-11', orderCloseOn: '2026/10/15',
    request: [['変更したいこと', '納品先の住所・電話番号（倉庫の移転）・請求書の宛先'], ['変更後の住所', '〒236-0004 神奈川県横浜市金沢区福浦1-5-3'], ['変更後の電話番号', '045-000-1133'], ['請求書の宛先', '法人（株式会社ことぶき商会）'], ['開始したいサイクル月', '2026年11月サイクル'], ['理由', '倉庫の移転と、請求の窓口を法人に一本化したい']],
    results: wait('CU01904') }),
    /* 承認で直す欄（M3：承認で拠点の住所・電話と親契約の請求先が変わる） */
    { zip: '236-0004', pref: '神奈川県', city: '横浜市金沢区', addr1: '福浦1-5-3', addr2: '', tel: '045-000-1133', billTo: '法人' }),
  ch({ id: 'CH-20260926-0001', kind: '休止', status: '承認待ち', corpId: 'CU00031', companyName: '株式会社ひかり物産', branchIds: ['CU01901'],
    requestedBy: { site: 'corp', accountId: 'CU00031', name: '光岡 舞（法人アカウント）' }, requestedAt: '2026/09/26 16:45', startCycle: '2026-12', orderCloseOn: '2026/11/15',
    request: [['休止の理由', 'オフィスの改装・移転'], ['休止したい期間', '3ヶ月（2026年12月〜2027年2月サイクル）'], ['再開予定月', '2027年3月サイクル'], ['休止中の設備', '引き揚げる']],
    change: { fromCycle: '2026-12', toCycle: '2027-02', resumeCycle: '2027-03', keepEquipment: false }, results: wait('CU01901') }),
  ch({ id: 'CH-20260927-0001', kind: '再開', status: '承認待ち', corpId: 'CU00001', companyName: '株式会社サンプル', branchIds: ['CU00902'],
    requestedBy: { site: 'corp', accountId: 'CU00902', name: '山本 由紀（拠点アカウント）' }, requestedAt: '2026/09/27 10:00', startCycle: '2027-01', orderCloseOn: '2026/12/15',
    request: [['再開するサイクル月', '2027年1月サイクル'], ['再開後のプラン', 'ES000003　50プラン（ESライト）（休止前と同じ）'], ['休止前からの変更', '契約内容：変更なし／オプション：変更なし／納品先：変更なし'], ['理由', '改装が終わり1月から通常出社に戻るため']],
    change: { resumeCycle: '2027-01' }, results: wait('CU00902') }),
  ch({ id: 'CH-20260927-0002', kind: '解約', status: '承認済', corpId: null, companyName: 'カフェ花', branchIds: ['CU01310'],
    requestedBy: { site: 'corp', accountId: 'CU01310', name: '花田 真理（拠点アカウント）' }, requestedAt: '2026/09/27 13:10', startCycle: '2026-10', orderCloseOn: '2026/09/15',
    request: [['解約をご希望の日', '2026年10月サイクルの最終日'], ['解約の理由', '店舗の閉店'], ['詳しい内容', '11月で横浜店を閉店するため']],
    change: { lastCycle: '2026-10' }, results: ok('2026/09/28 10:00', 'Ad00002', 'CU01310') }),
  ch({ id: 'CH-20260918-0001', kind: '休止', status: '承認済', corpId: 'CU00001', companyName: '株式会社サンプル', branchIds: ['CU00643'],
    requestedBy: { site: 'corp', accountId: 'CU00001', name: '佐藤 誠（法人アカウント）' }, requestedAt: '2026/09/18 09:30', startCycle: '2026-12', orderCloseOn: '2026/11/15',
    request: [['休止の理由', '拠点改装のため'], ['休止したい期間', '3サイクル（2026年12月〜2027年2月サイクル）'], ['再開予定月', '2027年3月サイクル'], ['休止中の設備', '置いたまま']],
    change: { fromCycle: '2026-12', toCycle: '2027-02', resumeCycle: '2027-03', keepEquipment: true }, results: ok('2026/09/19 11:00', 'Ad00001', 'CU00643') }),
  ch({ id: 'CH-20260715-0001', kind: '休止', status: '承認済', corpId: 'CU00001', companyName: '株式会社サンプル', branchIds: ['CU00902'], proxy: true,
    requestedBy: { site: 'ops', accountId: 'Ad00001', name: '運営（代理入力：電話・山本 由紀 様より）' }, requestedAt: '2026/07/15 15:00', startCycle: '2026-10', orderCloseOn: '2026/09/15',
    request: [['休止の理由', '改装のため'], ['休止したい期間', '3サイクル（2026年10月〜12月サイクル）'], ['再開予定月', '2027年1月サイクル'], ['休止中の設備', '置いたまま']],
    change: { fromCycle: '2026-10', toCycle: '2026-12', resumeCycle: '2027-01', keepEquipment: true }, results: ok('2026/07/15 15:10', 'Ad00001', 'CU00902') }),
  /* 法人Web 契約の申請の見本：お受けできませんでした（却下）と取り下げ（確認メモ_法人B1 D10・hong 2026-10-08） */
  ch({ id: 'CH-20260930-0001', kind: '設備の変更', status: '却下', corpId: 'CU00001', companyName: '株式会社サンプル', branchIds: ['CU00950'],
    requestedBy: { site: 'corp', accountId: 'CU00001', name: '佐藤 誠（法人アカウント）' }, requestedAt: '2026/09/30 10:00', startCycle: '2026-11', orderCloseOn: '2026/10/15',
    request: [['変更したいこと', '設備の変更'], ['ご希望の内容', '設備を追加したい'], ['追加したい設備', 'RF000003　冷蔵ショーケース 105L'], ['台数', '1台']],
    results: [{ branchId: 'CU00950', result: 'ng', reason: '設備・在庫の手配ができない', by: 'Ad00002', at: '2026/10/01 11:00' }] }),
  ch({ id: 'CH-20260930-0002', kind: 'プランの変更', status: '取り下げ済', corpId: 'CU00001', companyName: '株式会社サンプル', branchIds: ['CU00961'],
    requestedBy: { site: 'corp', accountId: 'CU00961', name: '高橋 健太（拠点アカウント）' }, requestedAt: '2026/09/30 14:00', startCycle: '2026-11', orderCloseOn: '2026/10/15',
    request: [['変更したいこと', 'プランの変更'], ['変更後のプラン', '100プラン（ESライト）']],
    results: [{ branchId: 'CU00961', result: 'wd', reason: '', by: 'CU00961', at: '2026/10/01 09:00' }] }),
  ch({ id: 'CH-20260705-0001', kind: '配送の変更', status: '承認済', corpId: 'CU00001', companyName: '株式会社サンプル', branchIds: ['CU00871'],
    requestedBy: { site: 'corp', accountId: 'CU00871', name: '中村 里奈（拠点アカウント）' }, requestedAt: '2026/07/05 10:00', startCycle: '2026-08', orderCloseOn: '2026/07/15',
    request: [['変更したいこと', '納品不可曜日に 水曜日 を追加'], ['開始したいサイクル月', '2026年8月サイクル']], results: ok('2026/07/06 10:00', 'Ad00011', 'CU00871') }),

  /* ===== 新規申込 ===== */
  ap({ id: 'AP-20260410-0019', kubun: '本導入', status: '完了', corpId: 'CU00001', companyName: '株式会社サンプル', branchIds: ['CU00871'], branchNames: [],
    requestedBy: { site: 'corp', accountId: 'CU00001', name: '佐藤 誠（法人アカウント）' }, requestedAt: '2026/04/10 11:00', startCycle: '2026-05',
    request: [['拠点', '大阪支店'], ['プラン', 'ES000003 50プラン（ESライト（冷蔵庫））'], ['配送', 'ES配送便・月2回']] }),
  ap({ id: 'AP-20260812-0044', kubun: 'お試し', status: '完了', corpId: 'CU00012', companyName: '株式会社みらい商事', branchIds: ['CU00701'], branchNames: [],
    requestedBy: { site: 'public', accountId: '', name: '伊藤 健' }, requestedAt: '2026/08/12 10:00', startCycle: '2026-09',
    request: [['拠点', '名古屋本社'], ['プラン', 'ES000003 50プラン（ESライト）'], ['配送', 'ES配送便']] }),
  ap({ id: 'AP-20260901-0021', kubun: 'お試し', status: '完了', corpId: 'CU00071', companyName: '株式会社みちのく商事', branchIds: ['CU00975'], branchNames: [],
    requestedBy: { site: 'public', accountId: '', name: '菅原 健' }, requestedAt: '2026/09/01 09:00', startCycle: '2026-10',
    request: [['拠点', '仙台本社'], ['プラン', 'ES000003 50プラン（ESライト）'], ['配送', 'COOL便・月1回']] }),
  ap({ id: 'AP-20261005-0071', kubun: '切替', status: '契約設定中', corpId: 'CU00012', companyName: '株式会社みらい商事', branchIds: ['CU00701'], branchNames: ['京都支店'],
    requestedBy: { site: 'corp', accountId: 'CU00012', name: '伊藤 健（法人アカウント）' }, requestedAt: '2026/10/05 08:50', startCycle: '2026-11',
    request: [['区分', 'お試しから本導入への切り替え（親契約はそのまま）＋京都支店の追加'], ['プラン', '複数（2拠点）'], ['配送', 'ES配送便・COOL便']] }),
  ap({ id: 'AP-20260920-0052', kubun: '本導入', status: '契約設定中', corpId: 'CU00020', companyName: '株式会社あおば工業', branchIds: ['CU01012'], branchNames: [],
    requestedBy: { site: 'public', accountId: '', name: '青葉 次郎' }, requestedAt: '2026/09/20 13:00', startCycle: '2026-11',
    request: [['拠点', '仙台工場'], ['プラン', 'ES000005 150プラン（ESスタンダード）'], ['配送', 'ES配送便']] }),
  ap({ id: 'AP-20260922-0057', kubun: 'お試し', status: '受付中', corpId: 'CU00031', companyName: '株式会社ひかり物産', branchIds: [], branchNames: ['横浜オフィス'],
    requestedBy: { site: 'corp', accountId: 'CU00031', name: '光岡 舞（法人アカウント）' }, requestedAt: '2026/09/22 10:00', startCycle: '2026-11',
    request: [['拠点', '横浜オフィス（新しい拠点）'], ['プラン', 'ES000003 50プラン（ESライト（自販機））'], ['配送', 'ES配送便']] }),
  ap({ id: 'AP-20261003-0069', kubun: '本導入', status: '受付中', corpId: 'CU00044', companyName: '株式会社ことぶき商会', branchIds: [], branchNames: ['大阪本店'],
    requestedBy: { site: 'corp', accountId: 'CU00044', name: '寿 一郎（法人アカウント）' }, requestedAt: '2026/10/03 14:30', startCycle: '2026-12',
    request: [['拠点', '大阪本店（新しい拠点）'], ['プラン', 'ES000004 100プラン（ESスタンダード）'], ['配送', 'COOL便']] }),
  ap({ id: 'AP-20260910-0031', kubun: '本導入', status: '受付中', corpId: null, companyName: '株式会社サンプルフーズ', branchIds: [], branchNames: ['東京本社', '東京本社（自販機）', '大阪支店', '福岡営業所'],
    requestedBy: { site: 'public', accountId: '', name: '佐藤 直樹' }, requestedAt: '2026/09/10 16:00', startCycle: '2026-11',
    request: [['拠点', '4拠点'], ['プラン', '複数（4拠点）'], ['配送', 'ES配送便・COOL便']] }),
  ap({ id: 'AP-20261001-0066', kubun: '本導入', status: '契約設定中', corpId: null, companyName: '株式会社みなと物流', branchIds: [], branchNames: ['横浜倉庫'],
    requestedBy: { site: 'public', accountId: '', name: '港 太郎' }, requestedAt: '2026/10/01 09:30', startCycle: '2026-11',
    request: [['拠点', '横浜倉庫'], ['プラン', 'ES000003 50プラン（ESライト）'], ['配送', 'ES配送便']] }),
  ap({ id: 'AP-20260915-0048', kubun: '本導入', status: '却下', corpId: null, companyName: '株式会社たかし食品', branchIds: [], branchNames: ['札幌工場'],
    requestedBy: { site: 'public', accountId: '', name: '高志 修' }, requestedAt: '2026/09/15 11:00', startCycle: '2026-11', reason: '配送エリア・配送ルートの都合で対応できない',
    request: [['拠点', '札幌工場'], ['プラン', 'ES000004 100プラン（ESスタンダード）'], ['配送', 'ES配送便']] }),
  ap({ id: 'AP-20260918-0050', kubun: 'お試し', status: '取り下げ済', corpId: null, companyName: '株式会社はなまる', branchIds: [], branchNames: ['渋谷オフィス'],
    requestedBy: { site: 'public', accountId: '', name: '花丸 優' }, requestedAt: '2026/09/18 10:00', startCycle: '2026-10', reason: '社内の検討が延期になったため',
    request: [['拠点', '渋谷オフィス'], ['プラン', 'ES000003 50プラン（ESライト）'], ['配送', 'ES配送便']] }),
];
