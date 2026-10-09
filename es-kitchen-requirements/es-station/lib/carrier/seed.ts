import { TROUBLE_TYPES, WAREHOUSES } from '@/lib/domain/seed/master';
import type { Profile } from './types';

/*
 * 委託配送先Web の見本のうち、共通データ（lib/domain）にないものだけ。
 * 配送・区間・トラブル・ドライバー・保冷バッグ・見積・お知らせは共通データ（dm.*）を読む（lib/carrier/fromDomain.ts）。
 * 引取先の名前・トラブルの種類は、画面がそのまま import するので共通データの見本から作る。
 */

/** 見本の委託配送先（栄成ロジ） */
export const SELF_ID = 'DE00001';
const SELF = '栄成ロジ';

/** 引取先（倉庫・中継。共通データの倉庫マスタの見本） */
export const WH: Record<string, string> = Object.fromEntries(
  WAREHOUSES.map((w) => [w.id, `${w.id} ${w.name}${w.type === 'relay' ? '（中継）' : ''}`]),
);

/* ---------- 見積依頼 ---------- */

/** 金額再確認の前回の見積（共通データの見積には金額再確認がないため、画面の見本の値のまま） */
export const PREV = { amount: 348000, file: `見積書_${SELF}.pdf`, date: '2026年10月3日', msg: '契約前の最終確認のため、前回ご回答いただいた金額・条件に変更がないかご確認ください。' };

export const NG_REASONS = ['配送エリア対象外', '車両・人員を確保できない', '取扱商品に対応できない', '希望開始日に間に合わない', 'その他'];

/* ---------- 配送 ---------- */

/** トラブルの種類（共通データのトラブルの種類と同じ名前） */
export const TRB_KINDS = TROUBLE_TYPES.filter((t) => t.id !== 'undecided').map((t) => t.name);

/* ---------- プロフィール ---------- */

export const PREFS = ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'];

/** 委託配送会社のマスタ（dm.master.carriers）にない値（カナ・住所・担当者・対応エリアの都道府県・車両）。共通データにまだないので carrier.profiles に持つ */
export function profiles(): Omit<Profile, 'name' | 'kind' | 'masterArea'>[] {
  return [{
    company: SELF_ID, kana: 'エイセイロジ', zip: '220-0012', pref: '神奈川県', city: '横浜市西区', addr: 'みなとみらい[番地]', bld: '', tel: '045-000-0001', fax: '',
    contacts: [
      { k: 'メイン担当者', n: '加藤 真由美', f: 'カトウ マユミ', m: 'm.kato@eisei-logi.example', t: '045-000-0001' },
      { k: 'サブ担当者', n: '山口 健', f: 'ヤマグチ ケン', m: 'k.yamaguchi@eisei-logi.example', t: '090-0000-0014' },
    ],
    areas: ['東京', '神奈川', '埼玉', '千葉', '静岡', '愛知'], ngDays: ['日'], areaNote: '小回り、配送の融通が利く',
    cars: ['軽四車両', '保冷車あり', '冷凍車あり'], frz: '不要', ref: '不要', sp: 'あり', carNote: '小回り、配送の融通が利く',
  }];
}
