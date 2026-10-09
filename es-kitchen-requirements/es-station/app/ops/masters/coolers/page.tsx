'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { GenListPage } from '@/app/ops/_general/GenListPage';
import type { GenCol } from '@/app/ops/_general/gen';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import carrierArea from '@/lib/domain/areas/carrier';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import type { GenRow } from '@/lib/ops/general/types';
import { CoolerModal } from './_ui/CoolerModal';

/*
 * 保冷バッグ台帳（AW_COOL_001・002・003。台帳 2026-10-06・受付簿 No.176）。
 * 「新規登録」＝「貸与の記録の登録」、鉛筆＝「貸与の記録の編集」のモーダル。番号を押すと詳細（…/coolers/[id]）。削除・CSV取込はない（使えなくなったものは状態を「廃棄」に）。
 * 登録はフル権限・システム管理、編集はそれに経理（権限表 rental：ボタンは GenListPage が権限で出し分ける）。
 * 返却日・返却数は共通データ（dm.carrier.coolers）の項目を画面で行に足す
 */
const carrierApi = domainApi(carrierArea);
const COLS: GenCol[] = [
  ['no', '番号', 'link u'], ['kind', '種類'], ['qty', '数', 'num'], ['carrier', '委託配送先'], ['pref', '都道府県'], ['staff', '渡した配送スタッフ'], ['date', '渡した日'],
  ['retOn', '返却日'], ['retQty', '返却数', 'num'], ['status', '状態'], ['memo', 'メモ', 'clip'], ['_act', '操作', 'e'],
];

/** 保冷バッグ台帳（元：renderGen('cooler')） */
export default function Page() {
  const { openModal } = useOps();
  const router = useRouter();
  const { data: coolers } = useDomainQuery(carrierApi, 'coolers', {});
  const mapRows = useCallback((rows: GenRow[]) => {
    const by = new Map((coolers ?? []).map((c) => [c.id, c]));
    return rows.map((r) => {
      const c = by.get(r._uid);
      return { ...r, retOn: c?.returnedOn ?? '', retQty: c?.returnedQty !== undefined ? String(c.returnedQty) : '' };
    });
  }, [coolers]);
  return (
    <GenListPage genKey="cooler" cols={COLS} mapRows={mapRows}
      onLink={(r) => router.push(`/ops/masters/coolers/${encodeURIComponent(r._uid)}`)}
      onNew={() => openModal(<CoolerModal />)} onEdit={(r) => openModal(<CoolerModal row={r} />)} />
  );
}
