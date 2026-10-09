'use client';

import { ApiError } from '@/lib/api/errors';
import { useQuery } from '@/lib/ops/core/client';
import { api } from '@/app/ops/_general/parts';
import { MultiDrop, type DropOpt } from '@/app/ops/masters/products/_parts/MultiDrop';
import { useOps } from './OpsProvider';
import { useCanAct } from './perm';

/*
 * 税率のドロップダウン（全画面で1つ。2026/10/03 決定）。選択肢は税率マスタ（dm.master.taxRates）。
 * 商品マスタと同じく、一覧の下からその場で足す・鉛筆で直す・使っていない税率はごみ箱で消す（使っていれば 409 のメッセージ）。
 * 足す・直す・消すのはシステム管理（権限付与）だけ（台帳 E 2026-10-05）。使っている税率は表示だけ直せる（％は新しい税率を足して切り替える）。
 *   value／onChange は税率 ID（TX01 など）。by='label' なら表示（'10%' など・マスタ管理の画面の値）、by='rate' なら％の数字の文字（'10'・請求の調整行）
 */
export function TaxRateSelect({ value, onChange, disabled, err, by = 'id', label = '税率' }: {
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  err?: boolean;
  by?: 'id' | 'label' | 'rate';
  label?: string;
}) {
  const { toast } = useOps();
  const canAct = useCanAct();
  const { data } = useQuery(api, 'taxRates');
  const rates = data ?? [];
  /* 画面に残っている古い表示（'軽減税率 8%' など）も数字で合わせる */
  const pct = (s: string) => /(\d+(?:\.\d+)?)\s*%/.exec(s)?.[1];
  const cur = by === 'rate' ? rates.find((t) => String(t.rate) === value)
    : rates.find((t) => t.id === value || t.label === value) ?? rates.find((t) => pct(value) !== undefined && String(t.rate) === pct(value));
  const opts: DropOpt[] = rates.map((t) => ({ value: t.id, label: t.label, used: t.used, removable: t.used === 0 }));
  /* by='label'・'rate' で新しく足した税率は、まだ rates にないので add の中で表示を渡す */
  const pick = (id: string | undefined) => {
    if (!id) return;
    if (by === 'id') { onChange?.(id); return; }
    const t = rates.find((x) => x.id === id);
    if (t) onChange?.(by === 'rate' ? String(t.rate) : t.label);
  };
  const add = async (text: string) => {
    const n = /(\d+(?:\.\d+)?)/.exec(text);
    if (!n) throw new ApiError('税率の数字を入れてください（例：8%（軽減））', 400);
    const t = await api.action('addTaxRate', { label: text, rate: Number(n[1]) });
    if (by === 'label') { onChange?.(t.label); return t.id; }
    if (by === 'rate') { onChange?.(String(t.rate)); return t.id; }
    return t.id;
  };
  /* 直す：表示の中の数字を％にする（使っている税率は表示だけ直せる・％は 409） */
  const edit = async (id: string, text: string) => {
    const n = /(\d+(?:\.\d+)?)/.exec(text);
    if (!n) throw new ApiError('税率の数字を入れてください（例：8%（軽減））', 400);
    const t = await api.action('updateTaxRate', { id, label: text, rate: Number(n[1]) });
    toast(`税率「${t.label}」を保存しました`);
    if (cur?.id === id && by !== 'id') onChange?.(by === 'rate' ? String(t.rate) : t.label);
  };
  const remove = async (id: string) => {
    const t = rates.find((x) => x.id === id);
    await api.action('removeTaxRate', { id });
    toast(`税率「${t?.label ?? id}」を削除しました`);
  };
  return (
    <MultiDrop single label={label} value={cur ? [cur.id] : value ? [value] : []} opts={opts} disabled={disabled} err={err}
      onChange={(v) => pick(v[0])} onAdd={canAct(api, 'addTaxRate') ? add : undefined} onRemove={canAct(api, 'removeTaxRate') ? remove : undefined} onEdit={canAct(api, 'updateTaxRate') ? edit : undefined} addPh="例：10% / 8%（軽減）" />
  );
}
