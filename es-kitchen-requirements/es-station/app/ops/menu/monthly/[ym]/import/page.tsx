'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@/lib/ops/core/client';
import { OpsCsvImportPage } from '@/app/ops/_ui/CsvImportPage';
import { Loading, NotFound, api } from '../../../_components/parts';
import { useMenu } from '../../../_components/MenuProvider';

/**
 * 月間メニューの CSV取込（画面。Phase 2 テンプレート：1行＝メニューの1商品。lib/csv/data.ts の menu・保存は menu.importCsv）。
 * 登録のあとは編集の画面へ戻る（読み直して下書きを作り直す）
 */
export default function Page() {
  const { ym } = useParams<{ ym: string }>();
  const { toast } = useMenu();
  const router = useRouter();
  const { data: m } = useQuery(api, 'menu', { ym });
  const back = `/ops/menu/monthly/${ym}/edit`;
  /* 編集中か公開中のメニューにだけ取り込める（E130）。締切済・配送中・終了は編集の画面へ戻す */
  const no = !!m && m.status !== '編集中' && m.status !== '公開中';
  useEffect(() => { if (no) { toast('編集中か公開中のメニューにだけ取り込めます。', 'negative'); router.replace(back); } }, [no, toast, router, back]);
  if (m === undefined || no) return <Loading />;
  if (m === null) return <NotFound what="メニュー" />;
  const published = m.status === '公開中';
  return (
    <OpsCsvImportPage look="es" crumbs={['メニュー管理', ['月間メニュー', '/ops/menu/monthly'], [ym, back]]}
      title={`${ym}のメニュー CSV取込`} back={back} entity="menu" scope={{ site: 'ops', target: ym }}
      /* 取り込めたら S10 と、取込の結果 S17（成功 n件・失敗 n件）。種類ごとの合計が 50 にならなくても止めない（合計は保存の確認で見る） */
      doneMessage={(c) => `CSVを取り込みました（新規${c.新規}件・更新${c.更新}件）。\n成功${c.成功}件・失敗${c.失敗}件です。`}
      options={published ? [{ key: 'notify', label: 'お客様へ知らせる（法人へ再通知。公開中のメニュー）', def: false }] : undefined}
      desc={<>1行＝メニューの1商品（年月・表示順・品番・公開可能・商品タグ・基準注文数 3種類・営業サンプル）。エラーの行は取り込まず、ほかの行でメニューを入れ替えます（エラーの行の商品がすでにメニューにあれば、そのまま残ります）。基準注文数は CSV の値を「手で直した値」として持ちます。取り込んだあとに「成功 n件・失敗 n件」を出します。種類ごとの合計が 50 にならなくても取り込みは止めません（合計はメニューの保存のときに確認します）。</>} />
  );
}
