'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { CsvImportModal } from '@/components/csv/CsvImportModal';
import { csvApi } from '@/components/csv/api';
import delivery from '@/lib/domain/areas/delivery';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import type { Cycle } from '@/lib/domain/types';
import { today } from '@/lib/supplier/dates';
import { OPS_CSV_UI, OPS_ID } from '../../_ui/csv';
import { useOps } from '../../_ui/OpsProvider';
import { useScreenCan } from '../../_ui/perm';
import { PageHead } from '../../_ui/ui';

/*
 * 既存のお客様の移行 CSV の取込（受付簿 No.28）。ファイルごとの画面（取込の流れは共通の CSV取込と同じ2段階：1. ファイルを選ぶ → 2. 確認・登録）。
 *   上：見出し（パンくず・画面名・キャンセル／登録）。A は「切替のサイクル月」を1回だけ選ぶ（子契約を作り始める月）。
 *   ファイルを選ぶ画面の説明に、取り込む順番と記入例（テンプレートの見本の行）を出す。列の定義は画面には出さない（画面設計書に書く・hong 2026/10/05）
 */
export const MIG_BASE = '/ops/migration';
export const MIG_IMPORT = `${MIG_BASE}/import`;

export type MigKind = 'sites' | 'loans' | 'contacts' | 'prices';
export const MIG_FILES: Record<MigKind, { entity: string; mark: string; title: string; unit: string; key: string; lead: string }> = {
  sites: { entity: 'migrationSites', mark: 'A', title: '法人・拠点・契約', unit: '1行＝1拠点', key: '拠点ID（フェーズ1の ID）',
    lead: '法人・拠点・親契約・子契約（プラン・コース・価格世代・オプション・値引き）・アカウントを、利用中で直接作ります。法人の列は同じ法人の行で同じ値にします。「法人ステータス（フェーズ1）」で、本登録＝利用中／仮登録＝仮登録のまま取り込み申込の受付（受付中）に載せる／休止中＝利用休止（休止の期間・再開月は要補完）／解約済・削除済＝取り込まない（対象外）。' },
  loans: { entity: 'migrationLoans', mark: 'B', title: '設備（貸出）', unit: '1行＝1拠点 × 1機種', key: '拠点ID＋機種ID',
    lead: '拠点に貸している設備を入れます。貸出日が空欄なら「貸出日 未入力」で入れ、最低利用期間・違約金は当初契約開始年月から推定します。A のあとに取り込みます。' },
  contacts: { entity: 'migrationContacts', mark: 'C', title: '担当者', unit: '1行＝1人（人数の上限なし）', key: '法人ID または 拠点ID',
    lead: '法人・拠点の担当者を入れます（メイン担当者は1人）。取り込み直すときは、その法人・拠点の担当者をファイルの中身で置き換えます。A のあとに取り込みます。' },
  prices: { entity: 'migrationPrices', mark: 'D', title: '企業独自価格', unit: '1行＝1拠点 × 1商品', key: '拠点ID＋品番',
    lead: 'A で 価格＝企業独自価格 にした拠点の、商品ごとの単価（税抜）を入れます。A のあとに取り込みます。' },
};
export const MIG_ORDER: MigKind[] = ['sites', 'loans', 'contacts', 'prices'];

const cycApi = domainApi(delivery);

/** 記入例（テンプレートの見本の行。値のある列だけ） */
export function SampleRows({ entity }: { entity: string }) {
  const [t, setT] = useState<{ head: string[]; rows: string[][] } | null>(null);
  useEffect(() => { csvApi.template(entity).then((x) => setT(x)).catch(() => setT(null)); }, [entity]);
  if (!t || !t.rows.length) return null;
  const use = t.head.map((h, i) => [h, i] as const).filter(([, i]) => t.rows.some((r) => (r[i] ?? '') !== ''));
  return (
    <div>
      <div className="hint" style={{ margin: '0.571429rem 0 0.285714rem' }}>記入例（値のある列だけ。空欄の列は省略。1行目の見出しは出力・テンプレートと同じ名前の列を使います）</div>
      <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead><tr>{use.map(([h]) => <th key={h} style={{ whiteSpace: 'nowrap' }}>{h.replace(/【[^】]*】/, '')}</th>)}</tr></thead>
          <tbody>{t.rows.map((r, k) => <tr key={k}>{use.map(([h, i]) => <td key={h} style={{ whiteSpace: 'nowrap' }}>{r[i] ?? ''}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

export default function MigrationImport({ kind }: { kind: MigKind }) {
  const router = useRouter();
  const { account, toast } = useOps();
  const can = useScreenCan();
  const f = MIG_FILES[kind];
  const label = `移行CSV取込 ${f.mark}. ${f.title}`;
  useEffect(() => { if (!can('csvImport')) router.replace(MIG_BASE); }, [can, router]);

  /* 切替のサイクル月（A だけ）。初期値＝今日を含むサイクル */
  const { data: cycles } = useDomainQuery(cycApi, 'cycles');
  const list = useMemo(() => ((cycles ?? []) as Cycle[]).map((c) => c.id).sort(), [cycles]);
  const [ym, setYm] = useState('');
  const dflt = useMemo(() => {
    const day = today();
    return ((cycles ?? []) as Cycle[]).find((c) => c.a1 <= day && day <= c.d7)?.id ?? day.slice(0, 7).replace('/', '-');
  }, [cycles]);
  const target = ym || dflt;

  /* 枠はファイルの種類ごとに1つ（画面が描き直されても取込の中身を作り直さない） */
  const Frame = useMemo(() => function Frame({ footer, children }: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode }) {
    return (
      <>
        <PageHead crumbs={['法人・契約管理', '移行の要補完', '移行CSV取込', `${f.mark}. ${f.title}`]} title={label}>{footer}</PageHead>
        <div className="card" id="sec-csv">{children}</div>
      </>
    );
  }, [f.mark, f.title, label]);

  const uiProps = useMemo(() => ({ ...OPS_CSV_UI, Frame }), [Frame]);
  return (
    <CsvImportModal
      ui={uiProps} entity={f.entity} title={label} by={account?.id ?? OPS_ID} notify={toast}
      scope={kind === 'sites' ? { site: 'ops', target } : { site: 'ops' }}
      onClose={() => router.push(MIG_IMPORT)}
      onDone={() => router.push(MIG_BASE)}
      desc={(
        <>
          <p style={{ margin: '0 0 0.428571rem' }}><b>{f.unit}</b>・キー＝{f.key}。{f.lead}</p>
          <p style={{ margin: '0 0 0.428571rem' }}>取り込む順番：A 法人・拠点・契約 → B 設備・C 担当者・D 企業独自価格（B〜D は A の拠点IDに結びつけます）。同じファイルを取り込み直すと更新します（空欄の列は変えません）。足りない項目は「移行の要補完」に出ます。受付・承認は通らず、メールは送りません。</p>
          {kind === 'sites' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.571429rem', margin: '0.571429rem 0' }}>
              <label htmlFor="mig-cycle"><b>切替のサイクル月</b></label>
              <select id="mig-cycle" className="sel" style={{ width: '12.857143rem' }} value={target} onChange={(e) => setYm(e.target.value)}>
                {(list.length ? list : [target]).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="hint">この月から子契約を作ります（より前の請求は参照のみ）。いま子契約がある最後のサイクル月まで作ります。</span>
            </div>
          )}
          <SampleRows entity={f.entity} />
        </>
      )}
    />
  );
}
