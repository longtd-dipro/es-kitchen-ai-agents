import type { MasterSpec } from '../types';
import { MATERIAL_COURSES } from '@/lib/domain/material';

/*
 * 資材マスタ一覧の項目（台帳 F「資材マスタの作り」・画面設計書 AW_MATE_001）。一覧だけ spec で描く。
 * 詳細・登録・編集は app/ops/masters/_masters/MaterialScreen.tsx（機種などの spec 駆動の画面ではなく、項目が少ないので専用の画面）なので detail は空
 * 検索：キーワード（資材ID・資材名）・コース・公開ステータス・取扱倉庫（倉庫区分「ピッキング倉庫（資材）」だけ）・削除済みを表示しない（画面の既定）
 * courseq・whq は検索だけに使う（コース・取扱倉庫を「／」でつないだ値。複数持てるのでどれかに一致で探す）
 */
export const MATERIALS_SPEC: MasterSpec = {
  kind: 'materials',
  list: {
    noun: '資材',
    title: '資材マスタ一覧',
    crumb0: 'マスタ管理',
    crumbCur: '資材マスタ',
    search: [
      { t: 'in', keys: 'id,name', ph: '資材ID、資材名', cls: 'es-field es-grow' },
      { t: 'sel', keys: 'courseq', label: 'コース', o: MATERIAL_COURSES, cls: 'es-field', match: 'has' },
      { t: 'sel', keys: 'pubst', label: '公開ステータス', o: ['公開', '非公開'], cls: 'es-field' },
      { t: 'sel', keys: 'whq', label: '取扱倉庫', o: [], dyn: 'wh', cls: 'es-field', match: 'has' },
    ],
    cols: [
      { text: '資材ID' }, { text: '写真' }, { text: '資材名' }, { text: 'コース' }, { text: '単位' },
      { text: '単価（税抜）', cls: 'r' }, { text: '税率', cls: 'r' }, { text: '取扱倉庫' }, { text: '公開ステータス' }, { text: '操作' },
    ],
    tdcls: { price: 'r', tax: 'r' },
    keys: ['id', 'photo', 'name', 'course', 'unit', 'price', 'tax', 'wh', 'pubst'],
  },
  detail: { crumb: '資材マスタ', title: '資材詳細', pid: '', sum: [], tabs: [], panes: [] },
};
