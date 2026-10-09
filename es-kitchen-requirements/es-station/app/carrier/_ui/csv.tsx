'use client';

import { useRouter } from 'next/navigation';
import type { ComponentProps, ReactNode } from 'react';
import { CsvExportButton } from '@/components/csv/CsvExportButton';
import { CsvImportModal, type CsvUi } from '@/components/csv/CsvImportModal';
import { runCsvExport, type ExportOpts } from '@/components/csv/api';
import { Icon } from './Icon';
import { useCarrierSignedIn } from './CarrierProvider';
import { Crumb, Modal, ModalHead } from './parts';

/*
 * 委託配送先Web の CSV出力・CSV取込（components/csv の部品に、委託配送先Web のモーダル・ボタン・表のクラスをつないだもの）。
 * 配送の文書（dm.delivery.*）には運営だけのメモがあるので、出力は画面の列だけ（自社の区間だけ）。取込は「配送スタッフ」の新規だけ（2026/10/03 決定）
 */
function Frame({ title, onClose, busy, footer, children }: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode }) {
  return (
    <Modal onClose={onClose} busy={busy} label={title}>
      <ModalHead onClose={onClose} busy={busy}>{title}</ModalHead>
      <div className="mb">{children}</div>
      <footer>{footer}</footer>
    </Modal>
  );
}
const TONE = { ok: 'b-green', info: 'b-blue', warn: 'b-amber', ng: 'b-red', mute: 'b-gray' } as const;
export const CARRIER_CSV_UI: CsvUi = {
  Frame, pri: 'btn pri', out: 'btn out', table: 'tbl', wrap: 'tbl-wrap', num: 'num r',
  badge: (t) => `badge ${TONE[t]}`, notice: (k) => (k === 'ng' ? 'err' : 'hint'), hint: 'hint',
};

/** 「CSV出力」（委託配送先Web のボタン） */
export function CarrierCsvExport<R>({ className = 'btn out', children, ...o }: Omit<ExportOpts<R>, 'site' | 'by'> & { className?: string; children?: ReactNode }) {
  const { company, toast } = useCarrierSignedIn();
  return (
    <CsvExportButton<R> className={className} site="carrier" by={company} notify={toast} scope={{ site: 'carrier', carrierId: company }} {...o}>
      {children ?? <><Icon name="dl" />CSV出力</>}
    </CsvExportButton>
  );
}
/** 出力を関数で呼ぶ */
export function useCarrierCsvExport() {
  const { company, toast, toastError } = useCarrierSignedIn();
  return async <R,>(o: Omit<ExportOpts<R>, 'site' | 'by'>) => {
    try {
      const { count, fileName } = await runCsvExport({ ...o, site: 'carrier', by: company, scope: { site: 'carrier', carrierId: company } });
      toast(`CSVを出力しました（${count.toLocaleString()}行・${fileName}）`);
    } catch (e) { toastError(e); }
  };
}

type ImportProps = Omit<ComponentProps<typeof CsvImportModal>, 'ui' | 'by' | 'onClose' | 'notify' | 'scope'>;
/** 「CSV取込」のボタン（委託配送先Web）→ CSV取込の画面（href。モーダルではなく画面・hong 2026/10/05） */
export function CarrierCsvImport({ href, className = 'btn out', children }: { href: string; className?: string; children?: ReactNode }) {
  const router = useRouter();
  return (
    <button type="button" className={className} onClick={() => router.push(href)}>
      {children ?? <><Icon name="upload" />CSV取込</>}
    </button>
  );
}

/**
 * CSV取込の画面（委託配送先Web）。パンくず・見出し（キャンセル／登録）・1 ファイルを選ぶ → 2 確認・登録。
 * キャンセル・登録のあとは back へ戻る
 */
export function CarrierCsvImportPage({ crumbs, title, back, ...p }: ImportProps & { crumbs: (string | [string, string])[]; title: string; back: string }) {
  const router = useRouter();
  const { company, toast } = useCarrierSignedIn();
  const Frame = ({ footer, children }: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode }) => (
    <>
      <Crumb items={[...crumbs, title]} />
      <div className="phead">
        <h1 className="ptitle">{title}</h1>
        <div style={{ display: 'flex', gap: '0.857143rem' }}>{footer}</div>
      </div>
      <div className="panel">{children}</div>
    </>
  );
  return <CsvImportModal ui={{ ...CARRIER_CSV_UI, Frame }} by={company} scope={{ site: 'carrier', carrierId: company }} onClose={() => router.push(back)} notify={toast} title={title} {...p} />;
}
