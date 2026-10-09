/*
 * 運営Web マスタ（仕入先・委託配送先・倉庫・配送スタッフ）の登録・編集の項目と入力チェック（画面とサーバーで同じ）。
 * 項目・必須・桁数・例は画面設計書（docs/05_画面設計書/データ/AW_SUPP・AW_CNSG・AW_WRHS・AW_DRVR の「詳細」「登録・編集」）と hong 2026-10-06 の回答。
 *   カード（sec）ごとに項目を並べる。住所（仕入先）・担当者は表（TDef：1行目＝本社／メイン担当者でちょうど1行、2行目から製造場所／サブ担当者）
 * 文言は _共通_メッセージ.py の社内向け（ja_o）：E01・E02・E03・E04・E05・E06・E07・E09・E10・E12・E14・E36・Q173・S173。
 * P-FORM：前後の空白を取り、全角の数字・英字・ハイフンは半角に直してからチェック・保存。最大文字数を超えたらエラー（切り詰めない）
 */
import { NG_DAYS, PREFS as PREF_LIST } from '@/lib/domain/prefs';

export type MKey = 'supplier' | 'consign' | 'warehouse' | 'driver';
export const MKEYS: MKey[] = ['supplier', 'consign', 'warehouse', 'driver'];
/** 表の1行（住所・担当者） */
export type FRow = Record<string, string>;
export type FVal = string | string[] | FRow[];
export type FormVals = Record<string, FVal>;
/** 選択肢（value＝保存する値、label＝見せる名前） */
export type Opt = { v: string; l: string; /** 所属先が自社（ES配送便） */ self?: boolean };

export type FDef = {
  k: string;
  label: string;
  /**
   * text・textarea・select・checks（チェックボックス）・radio・chips（複数選ぶチップ）・prefs（都道府県を地方ごとに選ぶ）・
   * license（免許証の写真のアップロード）・ro（表示だけ。値は rec から）
   */
  t: 'text' | 'textarea' | 'select' | 'checks' | 'radio' | 'chips' | 'prefs' | 'license' | 'ro';
  /** 置くカード */
  sec: string;
  req?: boolean;
  /** 条件つきの必須 */
  reqIf?: (v: FormVals) => boolean;
  max?: number;
  fmt?: 'tel' | 'mail' | 'url' | 'zip' | 'kana' | 'yen' | 'areaFees';
  /** 固定の選択肢（ないときはサーバーの opts[k]） */
  opts?: readonly string[];
  ex?: string;
  hint?: string;
  /** 登録のときだけ選べる（編集では表示だけ） */
  newOnly?: boolean;
  /** 画面では変えられない（ほかの項目から決まる・システムが決める） */
  auto?: boolean;
  /** 出す条件 */
  when?: (v: FormVals) => boolean;
  /** 押せない（薄く出す・チェックしない）条件 */
  off?: (v: FormVals) => boolean;
  /** 1行全部の幅 */
  full?: boolean;
  /** 郵便番号の右に「住所検索」（都道府県・市区町村・町域・番地を入れる） */
  zipSearch?: boolean;
};

/** 表の列 */
export type TCol = { k: string; label: string; req?: boolean; max?: number; fmt?: FDef['fmt']; opts?: readonly string[]; ex?: string };
/** 表（1行目＝main でちょうど1行・消せない。2行目から sub で0行以上） */
export type TDef = { k: 'addresses' | 'contacts'; sec: string; main: string; sub: string; cols: TCol[]; addLabel: string };

export const AREAS = ['全国', '北海道', '東北', '関東', '中部', '関西', '中国', '四国', '九州', '沖縄', '西日本'] as const;
export const TEMPS = ['冷蔵', '冷凍', '常温', '資材'] as const;
export const WH_KINDS = ['ピッキング倉庫', 'ピッキング倉庫（資材）', '中継倉庫', '返送先'] as const;
export const RELAY_KINDS = ['運送会社', 'それ以外（SC含む）'] as const;
export const SUPPLIER_KINDS = ['通常商品', '短消費期限商品', '資材'] as const;
/** 作れる商品（仕入先Web の申込フォームと同じ選択肢：app/supplier/(auth)/apply/page.tsx の GOODS） */
export const GOODS = ['惣菜', '弁当', '肉類', '魚類', 'サラダ・スープ', 'パン・ごはん', 'おにぎり・サンドイッチ', '甘味・ドリンク', '資材（箸・容器など）'] as const;
export const PREFS = PREF_LIST;
/**
 * 委託配送先の保有車両。軽四車両・保冷車あり・冷凍車あり は配送会社の申込フォームと hong の参考画面で確認済み。
 * 普通車両・2tトラック・4tトラック は仮（hong 未確認・2026-10-06）
 */
export const CARS = ['軽四車両', '普通車両', '2tトラック', '4tトラック', '保冷車あり', '冷凍車あり'] as const;
/** 委託配送先の支払条件。月末締め翌月末払い は確認済み、20日締め翌月払い・15日締め当月末払い は仮（hong 未確認・2026-10-06） */
export const PAY_TERMS = ['月末締め翌月末払い', '20日締め翌月払い', '15日締め当月末払い'] as const;
/** 配送スタッフの区分（hong 2026-10-06：自社／委託 から置き換え） */
export const STAFF_KINDS = ['個人', '会社所属'] as const;
export const DRIVER_STATUS = ['有効', '利用停止', '免許未登録', '無効'] as const;
/** 免許証がなくアカウントもないスタッフ（台帳 K：免許がないスタッフにはアカウントを出さない） */
export const DRIVER_NO_LICENSE_NOTE = '免許証の写真がないため「免許未登録」で登録します（アカウントは発行しません）';
export const FEE_NOTE = '1件の支払額は、これから納品する区間に使います（納品済みの区間は納品したときの額のまま）';
const isRelay = (v: FormVals) => v.kind === '中継倉庫';

const CONTACTS = (sec: string, telReq = false): TDef => ({
  k: 'contacts', sec, main: 'メイン担当者', sub: 'サブ担当者', addLabel: '行を追加',
  cols: [
    { k: 'name', label: '担当者名', req: true, max: 60, ex: '田中 次郎' },
    { k: 'kana', label: 'フリガナ', max: 60, fmt: 'kana', ex: 'タナカ ジロウ' },
    { k: 'email', label: 'メールアドレス', req: true, max: 160, fmt: 'mail', ex: 'tanaka@example.jp' },
    { k: 'tel', label: 'TEL', req: telReq, max: 20, fmt: 'tel', ex: '03-1234-5678' },
  ],
});

export const FIELDS: Record<MKey, FDef[]> = {
  supplier: [
    { k: 'name', sec: '基本情報', label: '仕入先名', t: 'text', req: true, max: 60, ex: '株式会社エービーシー食品' },
    { k: 'kana', sec: '基本情報', label: 'カナ', t: 'text', max: 60, fmt: 'kana', ex: 'カブシキガイシャ エービーシーショクヒン' },
    { k: 'status', sec: '基本情報', label: 'ステータス', t: 'ro', req: true, auto: true, hint: '新規は「未発行」。アカウントを発行すると「本登録」（申込中・却下は申込の確認で処理します）' },
    { k: 'goods', sec: '基本情報', label: '作れる商品', t: 'chips', req: true, opts: GOODS, full: true },
    { k: 'kind', sec: '基本情報', label: '仕入れ先区分', t: 'select', req: true, opts: SUPPLIER_KINDS, hint: '主に扱う区分' },
    { k: 'biz', sec: '基本情報', label: '土日祝を営業日', t: 'select', opts: ['はい', 'いいえ'] },
    { k: 'method', sec: '基本情報', label: '発注方法', t: 'select', opts: ['ESステーション', 'メール', '外部'] },
    { k: 'note', sec: '基本情報', label: '備考', t: 'textarea', max: 500, full: true, hint: '運営だけが見るメモ' },
  ],
  consign: [
    { k: 'name', sec: '基本情報', label: '委託配送先名', t: 'text', req: true, max: 60, ex: '〇〇運送株式会社' },
    { k: 'kana', sec: '基本情報', label: 'カナ', t: 'text', max: 60, fmt: 'kana', ex: 'マルマルウンソウ' },
    { k: 'status', sec: '基本情報', label: 'ステータス', t: 'select', req: true, opts: ['有効', '無効'], hint: '「無効」にするとログインできなくなります' },
    { k: 'kind', sec: '基本情報', label: '区分', t: 'select', req: true, opts: ['委託・引き取り', '路線（中継あり）'] },
    { k: 'temps', sec: '基本情報', label: '温度帯', t: 'checks', opts: TEMPS },
    /* 1件の支払額・エリア別の支払額は画面に出さない（AW_CNSG_004 から外した。CSV取込・CSV出力の列には残す。保存では今の値のまま） */
    { k: 'track', sec: '基本情報', label: '追跡URLのひな形', t: 'text', max: 255, fmt: 'url', ex: 'https://track.example.jp/?no={追跡番号}', full: true },
    { k: 'payTerms', sec: '基本情報', label: '支払条件', t: 'select', req: true, opts: PAY_TERMS, hint: '確認済の選択肢は「月末締め翌月末払い」（ほかは仮）' },
    { k: 'note', sec: '基本情報', label: '備考', t: 'textarea', max: 500, full: true, hint: '運営だけが見るメモ' },
    { k: 'zip', sec: '住所', label: '郵便番号', t: 'text', req: true, max: 8, fmt: 'zip', ex: '105-0011', zipSearch: true },
    { k: 'pref', sec: '住所', label: '都道府県', t: 'select', req: true, opts: PREFS },
    { k: 'city', sec: '住所', label: '市区町村', t: 'text', req: true, max: 60, ex: '港区' },
    { k: 'addr1', sec: '住所', label: '町域・番地', t: 'text', req: true, max: 100, ex: '芝公園1-2-3' },
    { k: 'addr2', sec: '住所', label: '建物・部屋番号', t: 'text', max: 100, ex: '〇〇ビル5F' },
    { k: 'tel', sec: '住所', label: '電話番号', t: 'text', req: true, max: 20, fmt: 'tel', ex: '03-1234-5678' },
    { k: 'fax', sec: '住所', label: 'FAX番号', t: 'text', max: 20, fmt: 'tel', ex: '03-1234-5679' },
    { k: 'prefs', sec: '対応エリア', label: '対応エリア', t: 'prefs', req: true, full: true, hint: '※一部でも対応可能なエリアを選択してください。' },
    { k: 'ngDays', sec: '対応エリア', label: '配送不可曜日', t: 'checks', opts: NG_DAYS, full: true },
    { k: 'areaNote', sec: '対応エリア', label: '対応エリアに関する備考', t: 'textarea', max: 500, full: true },
    { k: 'cars', sec: '車両・設備情報', label: '保有車両', t: 'chips', req: true, opts: CARS, full: true },
    { k: 'frz', sec: '車両・設備情報', label: '冷凍ボックスのレンタル希望', t: 'radio', req: true, opts: ['不要', '要'] },
    { k: 'ref', sec: '車両・設備情報', label: '冷蔵ボックスのレンタル希望', t: 'radio', req: true, opts: ['不要', '要'] },
    { k: 'sp', sec: '車両・設備情報', label: '冷蔵保管スペース', t: 'radio', req: true, opts: ['あり', 'なし'] },
    { k: 'carNote', sec: '車両・設備情報', label: '車両・設備情報に関する備考', t: 'textarea', max: 500, full: true },
  ],
  warehouse: [
    { k: 'status', sec: '基本情報', label: 'ステータス', t: 'select', req: true, opts: ['有効', '無効'] },
    { k: 'name', sec: '基本情報', label: '倉庫名', t: 'text', req: true, max: 60, ex: '東京第一倉庫' },
    { k: 'slipName', sec: '基本情報', label: '倉庫名（伝票用）', t: 'text', req: true, max: 60, ex: 'ESキッチン 東京第一倉庫', hint: '伝票に印字する倉庫名' },
    { k: 'kana', sec: '基本情報', label: '倉庫名カナ', t: 'text', max: 60, fmt: 'kana', ex: 'トウキョウダイイチソウコ' },
    { k: 'kind', sec: '基本情報', label: '倉庫区分', t: 'radio', req: true, opts: WH_KINDS, newOnly: true, full: true, hint: '登録後は変えられません（ID の頭が変わるため）' },
    { k: 'relayKind', sec: '基本情報', label: '中継倉庫区分', t: 'radio', reqIf: isRelay, opts: RELAY_KINDS, off: (v) => !isRelay(v), hint: '倉庫区分が「中継倉庫」のときだけ選びます' },
    { k: 'carrierId', sec: '基本情報', label: '運営している委託配送会社', t: 'select', reqIf: (v) => isRelay(v) && v.relayKind === '運送会社', when: (v) => isRelay(v) && v.relayKind === '運送会社' },
    { k: 'branchCode', sec: '基本情報', label: '営業所コード', t: 'text', max: 20, ex: 'TKY-01', off: (v) => !isRelay(v), hint: '中継倉庫のときに使います' },
    { k: 'thomas', sec: '基本情報', label: '倉庫コード', t: 'text', max: 20, ex: 'KNT-01', off: isRelay, hint: 'トーマスへの出荷指示で使う自社コード。' },
    { k: 'zip', sec: '住所', label: '郵便番号', t: 'text', req: true, max: 8, fmt: 'zip', ex: '105-0011', zipSearch: true },
    { k: 'pref', sec: '住所', label: '都道府県', t: 'text', req: true, max: 10, ex: '東京都' },
    { k: 'city', sec: '住所', label: '市区町村', t: 'text', req: true, max: 60, ex: '港区' },
    { k: 'addr1', sec: '住所', label: '町域・番地', t: 'text', req: true, max: 100, ex: '芝公園1-2-3' },
    { k: 'addr2', sec: '住所', label: '建物・部屋番号', t: 'text', max: 100, ex: '〇〇ビル5F' },
    { k: 'tel', sec: '住所', label: '電話番号', t: 'text', req: true, max: 20, fmt: 'tel', ex: '03-1234-5678' },
    { k: 'fax', sec: '住所', label: 'FAX番号', t: 'text', max: 20, fmt: 'tel', ex: '03-1234-5679' },
    /* 備考は住所のカードの最後（AW_WRHS_004 の 3.9） */
    { k: 'note', sec: '住所', label: '備考', t: 'textarea', max: 500, full: true, hint: '運営だけが見るメモ' },
  ],
  driver: [
    { k: 'name', sec: '基本情報', label: '配送スタッフ名', t: 'text', req: true, max: 50, ex: '山田 太郎' },
    { k: 'kana', sec: '基本情報', label: '配送スタッフ名カナ', t: 'text', req: true, max: 50, fmt: 'kana', ex: 'ヤマダ タロウ' },
    { k: 'carrierId', sec: '基本情報', label: '所属先', t: 'select', req: true, newOnly: true, hint: '登録後は変えられません' },
    { k: 'staffKind', sec: '基本情報', label: '区分', t: 'select', req: true, opts: STAFF_KINDS },
    { k: 'status', sec: '基本情報', label: 'ステータス', t: 'select', req: true, opts: DRIVER_STATUS, hint: '「無効」「利用停止」にするとログインできなくなります' },
    { k: 'tel', sec: '基本情報', label: '電話番号', t: 'text', max: 20, fmt: 'tel', ex: '090-1234-5678' },
    { k: 'license', sec: '基本情報', label: '免許証', t: 'license', req: true, full: true, hint: '運転免許証の写真（JPEG・PNG、5MBまで）。ないときは「免許未登録」で登録し、アカウントは発行しません' },
    { k: 'loginId', sec: '担当者', label: 'ログインID', t: 'ro', auto: true, hint: '配送スタッフIDと同じ' },
    { k: 'email', sec: '担当者', label: 'メールアドレス', t: 'text', req: true, max: 160, fmt: 'mail', ex: 'yamada@example.jp', hint: 'ログイン案内・パスワード再設定のメールの宛先' },
    { k: 'lastLogin', sec: '担当者', label: '最終ログイン日時', t: 'ro', auto: true },
  ],
};

/** 表（住所・担当者） */
export const TABLES: Record<MKey, TDef[]> = {
  supplier: [
    {
      k: 'addresses', sec: '住所', main: '本社', sub: '製造場所', addLabel: '行を追加',
      cols: [
        { k: 'zip', label: '郵便番号', req: true, max: 8, fmt: 'zip', ex: '103-0027' },
        { k: 'pref', label: '都道府県', req: true, opts: PREFS },
        { k: 'city', label: '市区町村', req: true, max: 60, ex: '中央区' },
        { k: 'addr1', label: '町域・番地', req: true, max: 100, ex: '日本橋1-2-3' },
        { k: 'addr2', label: '建物・部屋番号', max: 100, ex: '〇〇ビル5F' },
        { k: 'tel', label: '電話番号', max: 20, fmt: 'tel', ex: '03-1234-5678' },
        { k: 'fax', label: 'Fax番号', max: 20, fmt: 'tel', ex: '03-1234-5679' },
      ],
    },
    CONTACTS('担当者'),
  ],
  consign: [CONTACTS('担当者', true)],
  warehouse: [CONTACTS('担当者')],
  driver: [],
};

/** カードの並び */
export const SECS: Record<MKey, string[]> = {
  supplier: ['基本情報', '住所', '担当者'],
  consign: ['基本情報', '対応エリア', '車両・設備情報', '住所', '担当者'],
  warehouse: ['基本情報', '住所', '担当者'],
  driver: ['基本情報', '担当者'],
};

const mainRow = (t: TDef): FRow => ({ kind: t.main, ...Object.fromEntries(t.cols.map((c) => [c.k, ''])) });
export const emptyRow = (t: TDef, sub = true): FRow => ({ ...mainRow(t), kind: sub ? t.sub : t.main });

/** 新規の初期値 */
export const NEW_VALS: Record<MKey, FormVals> = {
  supplier: { status: '未発行', goods: [], biz: 'いいえ', method: 'ESステーション', addresses: [mainRow(TABLES.supplier[0])], contacts: [mainRow(TABLES.supplier[1])] },
  consign: { status: '有効', temps: [], prefs: [], ngDays: [], cars: [], frz: '不要', ref: '不要', sp: 'あり', payTerms: '月末締め翌月末払い', contacts: [mainRow(TABLES.consign[0])] },
  warehouse: { status: '有効', contacts: [mainRow(TABLES.warehouse[0])] },
  driver: { status: '有効', staffKind: '会社所属', license: '' },
};

/* ---------- 文言（社内向け ja_o） ---------- */
export const MSG = {
  E01: (l: string) => `${l}は必須項目です。`,
  E02: (l: string) => `${l}を選択してください。`,
  E03: (l: string) => `${l}は全角カタカナで入力してください。`,
  E04: (n: number) => `${n}文字以内で入力してください。`,
  E05: '郵便番号は数字7桁で入力してください。',
  E06: (l: string) => `${l}は数字とハイフンで入力してください。`,
  E07: '正しいメールアドレスの形式で入力してください。',
  E09: (l: string) => `${l}は既に登録されています。`,
  E10: '正しいURLの形式で入力してください。',
  E12: (l: string, min: string, max: string) => `${l}は${min}〜${max}の範囲で入力してください。`,
  E14: (l: string) => `${l}は数値で入力してください。`,
  E36: '削除済みのため編集できません。',
  /** パスワード送信の確認（Q173）・送った（S173） */
  Q173: (mail: string) => `${mail} にパスワード設定のご案内を送ります。よろしいですか？`,
  S173: 'パスワード設定のご案内を送りました。',
  /** 住所検索で見つからない（I01 の形） */
  ZIP_NONE: '該当する住所がありません',
};

/* ---------- 正規化（P-FORM） ---------- */
/** 全角の数字・英字・記号（！〜～）とハイフンを半角に。長音（ー）はそのまま */
export const toHalf = (s: string) => s.replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[‐−―]/g, '-').replace(/　/g, ' ');
/** 名前などの文字：前後の空白を取り、全角の数字・英字・ハイフンだけ半角に */
const toHalfAlnum = (s: string) => s.replace(/[０-９Ａ-Ｚａ-ｚ－]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[‐−]/g, '-');
const normOne = (x: string, fmt?: FDef['fmt']) => {
  const t = x.trim();
  return fmt && ['tel', 'mail', 'url', 'zip', 'yen'].includes(fmt) ? toHalf(t).trim() : fmt === 'kana' ? t.replace(/　/g, ' ') : toHalfAlnum(t);
};

export const str = (v: FormVals, k: string) => (typeof v[k] === 'string' ? (v[k] as string) : '');
export const list = (v: FormVals, k: string) => (Array.isArray(v[k]) ? (v[k] as unknown[]).filter((x): x is string => typeof x === 'string') : []);
export const rowsOf = (v: FormVals, k: string): FRow[] => (Array.isArray(v[k]) ? (v[k] as unknown[]).filter((x): x is FRow => !!x && typeof x === 'object') : []);

export function normalizeForm(key: MKey, v: FormVals): FormVals {
  const out: FormVals = { ...v };
  for (const f of FIELDS[key]) {
    const x = v[f.k];
    if (typeof x !== 'string' || f.t === 'license' || f.t === 'ro') continue;
    out[f.k] = normOne(x, f.fmt);
  }
  for (const t of TABLES[key]) {
    out[t.k] = rowsOf(v, t.k).map((r, i) => ({
      ...Object.fromEntries(t.cols.map((c) => [c.k, normOne(r[c.k] ?? '', c.fmt)])),
      /* 1行目＝本社／メイン担当者、2行目から製造場所／サブ担当者（区分は行で決まる） */
      kind: i === 0 ? t.main : t.sub,
    }));
  }
  return out;
}
/** 出す項目（中継倉庫だけの項目など） */
export const shownFields = (key: MKey, v: FormVals) => FIELDS[key].filter((f) => !f.when || f.when(v));

/** エリア別の支払額の1行（「関東:2000」）。区切りは「・」「/」「;」・改行 */
export const AREA_FEE_SPLIT = /[・;/／\n]/;
const AREA_FEE_ONE = /^[^:：]+[:：]\s*[\d,]+\s*円?$/;

/** 1つの値の形のチェック（文言。問題なければ ''） */
function fmtErr(label: string, x: string, max?: number, fmt?: FDef['fmt']): string {
  if (fmt === 'yen') {
    if (!/^\d+$/.test(x.replace(/,/g, ''))) return MSG.E14(label);
    if (Number(x.replace(/,/g, '')) > 9999999) return MSG.E12(label, '0', '9,999,999');
    return '';
  }
  if (max && [...x].length > max) return MSG.E04(max);
  if (fmt === 'tel' && !/^[\d-]+$/.test(x)) return MSG.E06(label);
  if (fmt === 'mail' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x)) return MSG.E07;
  if (fmt === 'url' && !/^https?:\/\/\S+$/.test(x)) return MSG.E10;
  if (fmt === 'zip' && !/^\d{3}-?\d{4}$/.test(x)) return MSG.E05;
  if (fmt === 'kana' && !/^[ァ-ヶー・ 　]+$/.test(x)) return MSG.E03(label);
  if (fmt === 'areaFees' && x.split(AREA_FEE_SPLIT).map((s) => s.trim()).filter(Boolean).some((s) => !AREA_FEE_ONE.test(s))) return `${label}は「関東:2000」の形で入力してください。`;
  return '';
}

/**
 * 入力チェック（保存のとき全部まとめて）。返り値＝項目 → 文言（表は「contacts.0.email」）。必須が空なら必須のエラーだけ。
 * 値は normalizeForm したあとのもの。免許証は必須だが、ないときは「免許未登録」で保存する（エラーにしない：hong 2026-10-06）
 */
export function validateForm(key: MKey, v: FormVals, mode: 'new' | 'edit'): Record<string, string> {
  const e: Record<string, string> = {};
  for (const f of shownFields(key, v)) {
    if (f.auto || f.t === 'ro' || f.t === 'license' || (f.newOnly && mode === 'edit') || f.off?.(v)) continue;
    const req = f.req || !!f.reqIf?.(v);
    if (f.t === 'checks' || f.t === 'chips' || f.t === 'prefs') {
      const xs = list(v, f.k);
      if (req && !xs.length) e[f.k] = MSG.E02(f.label);
      else if (f.opts && xs.some((x) => !f.opts!.includes(x))) e[f.k] = MSG.E02(f.label);
      else if (f.t === 'prefs' && xs.some((x) => !(PREFS as readonly string[]).includes(x))) e[f.k] = MSG.E02(f.label);
      continue;
    }
    const x = str(v, f.k);
    if (!x) { if (req) e[f.k] = f.t === 'select' || f.t === 'radio' ? MSG.E02(f.label) : MSG.E01(f.label); continue; }
    if ((f.t === 'select' || f.t === 'radio') && f.opts && !f.opts.includes(x)) { e[f.k] = MSG.E02(f.label); continue; }
    const m = fmtErr(f.label, x, f.max, f.fmt);
    if (m) e[f.k] = m;
  }
  for (const t of TABLES[key]) {
    const rows = rowsOf(v, t.k);
    if (!rows.length) { e[`${t.k}.0.${t.cols[0].k}`] = MSG.E01(t.cols[0].label); continue; }
    rows.forEach((r, i) => {
      for (const c of t.cols) {
        const x = (r[c.k] ?? '').trim();
        const k = `${t.k}.${i}.${c.k}`;
        if (!x) { if (c.req) e[k] = c.opts ? MSG.E02(c.label) : MSG.E01(c.label); continue; }
        if (c.opts && !c.opts.includes(x)) { e[k] = MSG.E02(c.label); continue; }
        const m = fmtErr(c.label, x, c.max, c.fmt);
        if (m) e[k] = m;
      }
    });
  }
  return e;
}

/** 郵便番号は 123-4567 で持つ */
export const zipOf = (s: string) => (/^\d{7}$/.test(s) ? `${s.slice(0, 3)}-${s.slice(3)}` : s);

/** 画面の版（同時更新の検知 E31）：保存する文書の中身から作る */
export function versionOfData(x: unknown): string {
  const s = JSON.stringify(x ?? null);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** 変更履歴の文：フォームの前後で変わった項目（短い値は「前 → 後」、表・長い値は「○○を更新」） */
export function formDiff(key: MKey, prev: FormVals, next: FormVals): string {
  const out: string[] = [];
  const same = (a: unknown, b: unknown) => stable(a ?? '') === stable(b ?? '') || (isEmpty(a) && isEmpty(b));
  for (const f of FIELDS[key]) {
    if (f.t === 'ro' || !(f.k in next) || same(prev[f.k], next[f.k])) continue;
    const a = prev[f.k], b = next[f.k];
    if (f.t === 'license') { out.push(b ? '免許証を登録' : '免許証を削除'); continue; }
    const pa = Array.isArray(a) ? (a as string[]).join('・') : String(a ?? ''), pb = Array.isArray(b) ? (b as string[]).join('・') : String(b ?? '');
    out.push(f.t !== 'textarea' && f.t !== 'prefs' && pa.length <= 40 && pb.length <= 40 ? `${f.label}を「${pa || '（空）'} → ${pb || '（空）'}」に変更` : `${f.label}を更新`);
  }
  for (const t of TABLES[key]) if (!same(prev[t.k], next[t.k])) out.push(`${t.sec}を更新`);
  return out.join('・');
}
/** 項目の順に左右されない比べ方（表の行のキーの順が違っても同じ） */
const stable = (x: unknown): string => (Array.isArray(x) ? `[${x.map(stable).join(',')}]`
  : x && typeof x === 'object' ? `{${Object.keys(x).sort().map((k) => `${k}:${stable((x as Record<string, unknown>)[k])}`).join(',')}}` : JSON.stringify(x));
const isEmpty = (x: unknown) => x == null || x === '' || (Array.isArray(x) && !x.length);

/** 住所検索の見本（本番は郵便番号の API。lib/corp/docs/apply/data.ts の ZIPS ＋倉庫の見本） */
export const ZIP_DEMO: Record<string, { pref: string; city: string; addr1: string }> = {
  '1000005': { pref: '東京都', city: '千代田区', addr1: '丸の内' },
  '1080075': { pref: '東京都', city: '港区', addr1: '港南' },
  '1050011': { pref: '東京都', city: '港区', addr1: '芝公園' },
  '1030027': { pref: '東京都', city: '中央区', addr1: '日本橋' },
  '1400002': { pref: '東京都', city: '品川区', addr1: '東品川' },
  '1350061': { pref: '東京都', city: '江東区', addr1: '豊洲' },
  '1500002': { pref: '東京都', city: '渋谷区', addr1: '渋谷' },
  '2200012': { pref: '神奈川県', city: '横浜市西区', addr1: 'みなとみらい' },
  '2100005': { pref: '神奈川県', city: '川崎市川崎区', addr1: '東田町' },
  '2430018': { pref: '神奈川県', city: '厚木市', addr1: '中町' },
  '5410041': { pref: '大阪府', city: '大阪市中央区', addr1: '北浜' },
  '5670888': { pref: '大阪府', city: '茨木市', addr1: '駅前' },
  '4600008': { pref: '愛知県', city: '名古屋市中区', addr1: '栄' },
  '4850041': { pref: '愛知県', city: '小牧市', addr1: '小牧' },
  '8120011': { pref: '福岡県', city: '福岡市博多区', addr1: '博多駅前' },
  '6048005': { pref: '京都府', city: '京都市中京区', addr1: '恵比須町' },
};
