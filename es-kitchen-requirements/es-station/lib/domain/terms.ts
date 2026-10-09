/**
 * 法人Web（お客様の画面・お客様に送る通知）で使う言い方と、保存する値（ドメインの値）の対応表。
 * 保存する値（本導入／COOL便／納品済／一部納品済）は変えない。表示するときだけ corpTerm() を通す。
 * 運営Web・仕様書では今の呼び名（本導入 など）のまま。
 *
 * 申請（法人Web → 運営Web）に残る項目名は、新しい言い方で保存する。運営側で項目名を読むときは、
 * 古い言い方の申請も残っているので、下の RE_* のように「新旧どちらも」読む。
 */

/** 保存する値 → お客様向けの言い方（上から順に当てる） */
const TERMS: [RegExp, string][] = [
  [/（COOL便）/g, '（クール便・宅配便）'],
  [/COOL便/g, 'クール便（宅配便）'],
  [/本導入/g, '正式なご契約'],
  [/一部納品済(?!み)/g, '一部お届け済'],
  [/納品済(?!み)/g, 'お届け済'],
];
/** 古い項目名 → 新しい項目名（古い申請の表示用） */
const OLD_LABELS: [RegExp, string][] = [
  [/納品先名・フリガナ/g, 'お届け先名・フリガナ'],
  [/納品先の住所/g, 'お届け先の住所'],
  [/納品不可曜日/g, 'お届けできない曜日'],
  [/納品予定日になった場合/g, 'お届けできない日になった場合'],
  [/納品回数/g, 'お届け回数'],
];

/** 法人Webに出す文字（値・項目名・文章）を、お客様向けの言い方にする（何度通しても同じ） */
export function corpTerm(s: string | null | undefined): string {
  if (!s) return s ?? '';
  let t = s;
  for (const [re, to] of TERMS) t = t.replace(re, to);
  for (const [re, to] of OLD_LABELS) t = t.replace(re, to);
  return t;
}

/** 契約種別・配送方法など、選択肢の値 → 表示（保存する値は value のまま） */
export const corpOpt = (v: string) => ({ value: v, label: corpTerm(v) });

/** 運営側：申請の項目名を読む正規表現（新旧どちらも） */
export const RE_NG_DAYS = /納品不可曜日|お届けできない曜日/;
export const RE_SHIP_COOL = /COOL便|クール便/;
