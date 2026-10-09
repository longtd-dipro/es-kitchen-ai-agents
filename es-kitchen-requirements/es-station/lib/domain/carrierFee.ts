import type { Carrier } from './types';

/*
 * 委託配送先のエリア別の支払額（台帳 E 2026-10-05「委託配送先のエリア別料金」・受付簿 No.59）。
 * エリアの名前は委託配送先の「対応エリア」と同じ（北海道・東北・関東・中部・関西・中国・四国・九州・沖縄。西日本＝関西〜沖縄、全国＝すべて）。
 * 届け先の都道府県からエリアを決め、エリア別の行があればその額、なければ 1件の支払額（feePerDelivery）
 */
const PREF_REGION: Record<string, string> = {
  北海道: '北海道',
  青森県: '東北', 岩手県: '東北', 宮城県: '東北', 秋田県: '東北', 山形県: '東北', 福島県: '東北',
  茨城県: '関東', 栃木県: '関東', 群馬県: '関東', 埼玉県: '関東', 千葉県: '関東', 東京都: '関東', 神奈川県: '関東',
  新潟県: '中部', 富山県: '中部', 石川県: '中部', 福井県: '中部', 山梨県: '中部', 長野県: '中部', 岐阜県: '中部', 静岡県: '中部', 愛知県: '中部',
  三重県: '関西', 滋賀県: '関西', 京都府: '関西', 大阪府: '関西', 兵庫県: '関西', 奈良県: '関西', 和歌山県: '関西',
  鳥取県: '中国', 島根県: '中国', 岡山県: '中国', 広島県: '中国', 山口県: '中国',
  徳島県: '四国', 香川県: '四国', 愛媛県: '四国', 高知県: '四国',
  福岡県: '九州', 佐賀県: '九州', 長崎県: '九州', 熊本県: '九州', 大分県: '九州', 宮崎県: '九州', 鹿児島県: '九州',
  沖縄県: '沖縄',
};
const WEST = new Set(['関西', '中国', '四国', '九州', '沖縄']);

/** 都道府県 → エリア（不明は ''） */
export const regionOf = (pref: string | undefined) => (pref ? PREF_REGION[pref.trim()] ?? '' : '');

/** その届け先（都道府県）に使う1件の支払額（税抜） */
export function carrierFeeFor(c: Pick<Carrier, 'feePerDelivery' | 'areaFees'> | undefined, pref?: string): number {
  if (!c) return 0;
  const fees = c.areaFees ?? [];
  if (!fees.length) return c.feePerDelivery;
  const reg = regionOf(pref);
  const row = fees.find((x) => x.area === reg) ?? fees.find((x) => x.area === '西日本' && WEST.has(reg)) ?? fees.find((x) => x.area === '全国');
  return row ? row.feeYen : c.feePerDelivery;
}

/** 画面の表記「関東:2,000円・中部:2,300円」 */
export const areaFeesText = (c: Pick<Carrier, 'areaFees'>) => (c.areaFees ?? []).map((x) => `${x.area}:${x.feeYen.toLocaleString()}円`).join('・');

/** CSV の文字列「関東:2000・中部:2300」（区切りは ・ か ; か 改行。円・, は無視） → エリア別の支払額 */
export function parseAreaFees(v: string): { area: string; feeYen: number }[] {
  return v.split(/[・;\n]/).map((s) => s.trim()).filter(Boolean).map((s) => {
    const [area, fee] = s.split(/[:：]/);
    return { area: (area ?? '').trim(), feeYen: Number(String(fee ?? '').replace(/[円,，\s]/g, '')) };
  }).filter((x) => x.area && Number.isFinite(x.feeYen));
}
