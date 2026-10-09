'use client';

import React from 'react';
import master from '@/lib/domain/areas/master';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import type { Material, Plan } from '@/lib/domain/types';
import { yen as fmtYen } from '@/lib/format/money';

/*
 * プランマスタの 初期備品（資材の初期セット・コースごと）と プランに含む資材（1サイクル月あたりの数）。共通データ dm.master.plans の
 * initialItems／includedMaterials（2026/10/03 回答）。
 *   初期備品＝仮登録で作る資材の初期セット（無料）。プランに含む資材＝同じサイクル月の注文でこの数を超えた分だけ 資材の単価 × 超えた数 を請求（単価 0円は請求しない）
 * 資材の単価・税率は資材マスタ。表は 資材 × コース（初期備品）＋ プランに含む数
 * カードに保存ボタン・変更履歴の表は置かない：画面の 登録／保存 で一緒に保存し（MasterDetail.tsx → master.setPlanMaterials）、
 * 変更はタブ「変更履歴」に出す（台帳 F「資材 × プランの表の置き場」・受付簿 #101）。値は MasterDetail が持つ（value／onChange）
 */
const api = domainApi(master);
const key = (course: string, id: string) => `${course}|${id}`;

/** カードの値（入力欄の文字のまま）。init＝「コース|資材ID」→ 数、inc＝資材ID → 数（空欄＝プランの食数） */
export type PlanMaterialsValue = { init: Record<string, string>; inc: Record<string, string> };
export const EMPTY_MATERIALS: PlanMaterialsValue = { init: {}, inc: {} };

/** 共通データのプランからカードの値を作る */
export const materialsOf = (p: Pick<Plan, 'initialItems' | 'includedMaterials'>): PlanMaterialsValue => ({
  init: Object.fromEntries((p.initialItems ?? []).map((i) => [key(i.course, i.materialId), String(i.qty)])),
  inc: Object.fromEntries((p.includedMaterials ?? []).map((i) => [i.materialId, String(i.qty)])),
});
const n = (v: string | undefined) => Number((v ?? '').replace(/\D/g, '')) || 0;
/** カードの値 → master.setPlanMaterials の引数（courses＝プランのコース）。空欄＝プランの食数（入れない）。0 も入れる（無料なし）：台帳 2026/10/03 */
export function materialsArgs(v: PlanMaterialsValue, courses: string[]) {
  const ids = new Set([...Object.keys(v.init).map((k) => k.split('|')[1]), ...Object.keys(v.inc)]);
  return {
    initialItems: courses.flatMap((c) => [...ids].map((id) => ({ course: c as Plan['prices'][number]['course'], materialId: id, qty: n(v.init[key(c, id)]) })).filter((x) => x.qty > 0)),
    includedMaterials: [...ids].filter((id) => String(v.inc[id] ?? '').trim() !== '').map((id) => ({ materialId: id, qty: n(v.inc[id]) })),
  };
}
/** 何か入っているか（何も入れていない新規登録では setPlanMaterials を呼ばない） */
export const hasMaterials = (v: PlanMaterialsValue) => Object.values(v.init).some((x) => String(x).trim() !== '') || Object.values(v.inc).some((x) => String(x).trim() !== '');

/**
 * course を渡すと、そのコースの初期備品の列だけ出す（コースごとのタブの中に置く・hong 2026/10/05）。月の無料数量はプラン共通なのでどのタブにも出す。
 * editable＝編集・新規登録のときだけ入力できる（詳細は表示だけ・hong 2026/10/05）
 */
export function PlanMaterials({ courses, meals, course, editable = false, value, onChange }: {
  courses: string[]; meals: string; course?: string; editable?: boolean; value: PlanMaterialsValue; onChange: (v: PlanMaterialsValue) => void;
}) {
  const { data: mats } = useDomainQuery(api, 'list', { kind: 'materials' });
  const rows = ((mats ?? []) as (Material & { status?: string })[]).filter((m) => m.status !== '削除済');
  const shown = course ? courses.filter((c) => c === course) : courses;
  const cell = (v: string | undefined, set: (v: string) => void, label: string, ph = '0') => (
    <td className="r"><input className="r" inputMode="numeric" style={{ width: '5.142857rem' }} value={v ?? ''} placeholder={editable ? ph : ''} aria-label={label} readOnly={!editable} onChange={(e) => set(e.target.value)} /></td>
  );
  return (
    <div className="card">
      <div className="ch">初期備品・プランに含む資材（共通データ）</div>
      <div className="cb">
        <p className="es-field__msg">
          初期備品＝仮登録のときに作る資材の初期セット（コースごとの数・無料）。プランに含む数＝同じサイクル月の資材の注文でこの数を超えた分だけ、資材マスタの単価 × 超えた数を請求します（単価 0円の資材は請求しません）。
          各コースに初期備品が1つ以上必要です。資材の単価・税率は資材マスタで直します。画面の「{editable ? '登録／保存' : '保存'}」で一緒に保存し、変更はタブ「変更履歴」に残ります。
        </p>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>資材</th><th className="r">単価（税抜）</th>
                {shown.map((c) => <th key={c} className="r">初期備品：{c}</th>)}
                <th className="r">月の無料数量（空欄＝プランの食数 {meals || '—'}）</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id}>
                  <td><span className="mono">{m.id}</span> {m.name}</td>
                  <td className="r">{fmtYen(m.priceYen ?? 0)}</td>
                  {shown.map((c) => <React.Fragment key={c}>{cell(value.init[key(c, m.id)], (v) => onChange({ ...value, init: { ...value.init, [key(c, m.id)]: v } }), `${m.name}の初期備品（${c}）`)}</React.Fragment>)}
                  {cell(value.inc[m.id], (v) => onChange({ ...value, inc: { ...value.inc, [m.id]: v } }), `${m.name}の月の無料数量`, meals)}
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={3 + shown.length} style={{ color: '#8a96a3', textAlign: 'center' }}>資材マスタに資材がありません</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
