'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { CsvImportModal } from '@/components/csv/CsvImportModal';
import { OPS_CSV_UI, OPS_ID } from './csv';
import { useOps } from './OpsProvider';
import { useScreenCan } from './perm';

/*
 * CSV取込の画面（法人一覧・拠点一覧・子契約一覧＝更新だけ／契約申請管理＝新規申込）。モーダルではなく1つの画面：台帳 E「CSV取込の画面」）。
 *   ① ファイルを選ぶ → ② 確認・登録（components/csv/CsvImportModal の中身。枠だけ画面用。マスタの MasterCsvImport と同じ形）
 *   CSV取込の権限がない役割が URL を直接開いたときは、一覧へ戻す
 */
export default function CsvImportScreen({ entity, title, listTitle, crumb0, listUrl, desc, descMore, newOnly, onDone }: { entity: string; title: string; listTitle: string; crumb0: string; listUrl: string; desc?: ReactNode; descMore?: ReactNode; /** 新規だけの取込（新規申込CSV取込）。省くと更新だけの取込 */ newOnly?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const { account, toast } = useOps();
  const can = useScreenCan();
  useEffect(() => { if (!can('csvImport')) router.replace(listUrl); }, [can, router, listUrl]);

  const Frame = ({ footer, step, children }: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode; step: 1 | 2 }) => (
    <>
      <div className="csvph">
        <div>
          <div className="crumb"><span>{crumb0}</span><span><a href="#" className="lnk" onClick={(e) => { e.preventDefault(); router.push(listUrl); }}>{listTitle}</a></span><span>{title}</span></div>
          <h1>{title}</h1>
        </div>
        <div className="btns">{footer}</div>
      </div>
      <ol className="steps" aria-label="取込の手順" style={{ justifyContent: 'center' }}>
        <li className={step === 2 ? 'done' : 'cur'}><i>1</i>ファイルを選ぶ</li>
        <li className={step === 2 ? 'cur' : ''}><i>2</i>確認・登録</li>
      </ol>
      <div className="card" id="sec-csv">
        <div className="ch">{step === 2 ? '確認・登録' : 'ファイルを選ぶ'}</div>
        <div className="cb">{children}</div>
      </div>
    </>
  );

  return (
    <section className="csvpage">
      <CsvImportModal
        ui={{ ...OPS_CSV_UI, Frame, stepsInFrame: true, pri: 'btn pri lg', out: 'btn out lg' }} entity={entity} title={title} by={account?.id ?? OPS_ID} notify={toast}
        updateOnly={!newOnly} newOnly={newOnly} onClose={() => router.push(listUrl)} onDone={onDone} desc={desc} descMore={descMore}
      />
    </section>
  );
}
