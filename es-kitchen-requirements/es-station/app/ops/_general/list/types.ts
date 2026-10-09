import type { ReactNode } from 'react';

/** 検索条件の1つ（元の filterBlock の filters） */
export type ListFilter =
  /** 文字の検索。keys の列（プレースホルダに書いた項目）の値に部分一致。keys がなければ行のどの値にでも部分一致。「検索」か Enter で効く */
  | { t: 'search'; ph: string; span?: 2; keys?: string[] }
  /** 選ぶ条件。col の値に opts の文字が含まれる行だけ出す（col なし＝見た目だけで絞らない） */
  | { t: 'select'; ph: string; col?: string; opts: string[]; span?: 2; /** 既定で選んでおく値（「すべて」の選択肢 all を持つ。未選択の行を作らない。例：商品の状態＝有効） */ init?: string; all?: string }
  /** 年月。col の値の年月が同じ行だけ出す（col なし＝見た目だけで絞らない） */
  | { t: 'month'; ph: string; col?: string; span?: 2 }
  /** 期間（から〜まで）。col の日付が範囲に入る行だけ出す（日付は yyyy-mm-dd・YYYY/MM/DD など isoDate が読める形） */
  | { t: 'range'; ph: string; col: string; span?: 2 }
  /** 月の範囲（開始月〜終了月）。col の値（yyyy-mm）が範囲に入る行だけ出す。opts＝選べる月、init＝開始・終了の初期値（未選択＝init）。終了月は開始月より前を選べない */
  | { t: 'monthRange'; ph: string; col: string; opts: string[]; init: string; span?: 2 }
  /** 複数選べる条件。col の値がどれかの選択肢に一致する行だけ出す（何も選ばない＝すべて） */
  | { t: 'multi'; ph: string; col: string; opts: string[]; span?: 2 }
  /** 「○○も表示」のチェック。外れているとき（既定）は col の値が val の行を出さない（例：無効の商品）。状態は f['show:<col>']＝'1' */
  | { t: 'show'; ph: string; col: string; val: string; span?: 2 };

/** 一覧の状態（元の lst()）。一覧ごと（key）に覚えておき、画面を移って戻っても残る */
export type ListState = {
  q: string;
  /** 選ぶ条件の値（列 → 値）。col のない条件は 'none:<番号>' */
  f: Record<string, string>;
  page: number;
  size: number;
  /** 検索条件の開閉 */
  open: boolean;
  /** 並べ替えの項目（'' ＝初期の順） */
  sk: string;
  dir: 'asc' | 'desc';
  /** 削除済みを表示しない */
  hideDel: boolean;
};

/**
 * 一覧の列。
 * td を渡さないときは r[key] を文字で出す（num は右寄せ）。
 * key が '_' で始まる列（写真・操作など）は並べ替えの項目に出さない。
 */
export type ListCol<R> = {
  key: string;
  label: string;
  num?: boolean;
  /** 操作の列（見出しを中央に） */
  act?: boolean;
  /** その列の <td> を返す */
  td?: (r: R, i: number) => ReactNode;
};
