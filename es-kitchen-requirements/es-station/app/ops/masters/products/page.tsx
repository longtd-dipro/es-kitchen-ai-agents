'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { GenListPage } from '@/app/ops/_general/GenListPage';
import { GEN } from '@/app/ops/_general/gen';
import type { ListFilter } from '@/app/ops/_general/list';
import { api } from '@/app/ops/_general/parts';
import { useProductDelete } from './_parts/useProductDelete';

/**
 * 商品マスタ 一覧（Phase 1 画面 10）。データは共通データ dm.master.products（lib/ops/general/fromDomain.ts の productRow）。
 * 品番＝詳細、鉛筆＝編集、ごみ箱＝削除（削除済として残す）。カテゴリ・仕入先の選択肢は共通データから。
 * CSV出力・CSV取込は共通の仕組み（lib/csv/master.ts の products・GenListPage）。取込は新規も作れる・公開したメニューにある商品の価格の変更は行のエラー
 */
export default function Page() {
  const router = useRouter();
  const del = useProductDelete();
  const { data: m } = useQuery(api, 'productMasters');
  const filters = useMemo<ListFilter[]>(() => (GEN.product.filters ?? []).map((f) => {
    if (f.t !== 'select' || !m) return f;
    if (f.col === 'cat') return { ...f, opts: m.categories.map((c) => c.name) };
    if (f.col === 'sup') return { ...f, opts: m.suppliers.map((s) => s.name) };
    return f;
  }), [m]);
  const base = '/ops/masters/products';
  return (
    <div className="pm-list">
    <GenListPage
      /* 税率・商品タグの CSV のボタンは置かない（税率は商品マスタのドロップダウンで足す・消す。商品タグは商品マスタに持たない。台帳 F 2026-10-07・2026-10-08） */
      genKey="product"
      filters={filters}
      /* 状態の絞り込み（有効／無効／削除済／すべて）は gen.ts の filters。一覧に「無効にする」ボタンは置かない（無効にするのは編集の状態欄：受付簿 #278）。削除は理由のモーダル（有効なメニュー・在庫）か確認 */
      onDel={(r) => del(r._uid, String(r.name))}
      onNew={() => router.push(`${base}/new`)}
      onLink={(r) => router.push(`${base}/${r._uid}`)}
      onEdit={(r) => router.push(`${base}/${r._uid}/edit?from=list`)}
    />
    </div>
  );
}
