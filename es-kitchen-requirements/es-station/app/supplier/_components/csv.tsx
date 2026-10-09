'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { CsvExportButton } from '@/components/csv/CsvExportButton';
import { CsvImportModal, type CsvUi } from '@/components/csv/CsvImportModal';
import type { ExportOpts } from '@/components/csv/api';
import { api } from '@/lib/api/supplier';
import type { AnswerInput, HonInput } from '@/lib/api/supplier';
import { R } from '@/lib/supplier/routes';
import { useSignedIn } from '@/lib/supplier/store';
import { Icon, Modal, PageHead } from './ui';

/*
 * 仕入先サイトの CSV出力・CSV取込（components/csv の部品に、仕入先サイトのモーダル・ボタン・表のクラスをつないだもの）。
 * 取込は「受注の回答」だけ（2026/10/03 決定）：確かめは共通の仕組み（lib/csv/sites.ts の supplierAnswers）、書くのは仕入先サイトの API（回答・本発注の承認）
 */
function Frame({ title, footer, children }: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode }) {
  return <Modal title={title} width={980} footer={footer}>{children}</Modal>;
}
const TONE = { ok: 'b-ok', info: 'b-info', warn: 'b-warn', ng: 'b-ng', mute: 'b-mute' } as const;
export const SUPPLIER_CSV_UI: CsvUi = {
  Frame, pri: 'btn pri lg', out: 'btn out', table: 'tbl', wrap: 'tbl-wrap', num: 'num',
  badge: (t) => `badge ${TONE[t]}`, notice: (k) => `notice ${k}`, hint: 'hint',
};

/** 「CSV出力」（仕入先サイトのボタン） */
export function SupplierCsvExport<R>({ className = 'btn out', children, ...o }: Omit<ExportOpts<R>, 'site' | 'by'> & { className?: string; children?: ReactNode }) {
  const { supplierId, toast } = useSignedIn();
  return (
    <CsvExportButton<R> className={className} site="supplier" by={supplierId ?? ''} notify={toast} scope={{ site: 'supplier', supplierId: supplierId ?? '' }} {...o}>
      {children ?? <><Icon name="down" />CSV出力</>}
    </CsvExportButton>
  );
}

/** 「受注の回答 CSV取込」のボタン → CSV取込の画面（モーダルではなく画面・hong 2026/10/05） */
export function SupplierAnswerImport() {
  const router = useRouter();
  return <button className="btn out" onClick={() => router.push(R.ordersImport)}><Icon name="upl" />受注の回答 CSV取込</button>;
}

/** 受注の回答 CSV取込の画面：納期回答待ちの発注は出荷予定日、本発注の承認待ちの発注は納品日・入荷箱数。登録のあとは受注一覧へ */
export function SupplierAnswerImportPage() {
  const router = useRouter();
  const { supplierId, toast, mergeOrders } = useSignedIn();
  const title = '受注の回答 CSV取込';
  const Frame = ({ footer, children }: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode }) => (
    <>
      <PageHead crumbs={['受注一覧', title]} title={title}>{footer}</PageHead>
      <div className="card">{children}</div>
    </>
  );
  return (
    <CsvImportModal ui={{ ...SUPPLIER_CSV_UI, Frame }} entity="supplierAnswers" title={title} by={supplierId ?? ''} scope={{ site: 'supplier', supplierId: supplierId ?? '' }}
      onClose={() => router.push(R.orders)} notify={toast}
      desc={<>1行＝1つの発注（発注番号がキー）。<b>納期回答待ち</b>の発注は「出荷予定日」（全量を1回で出荷）、<b>本発注の承認待ち</b>の発注は「納品日」と「入荷箱数」を入れます。分納の回答は発注の詳細から。</>}
      onFollow={async (fs) => {
        for (const f of fs) {
          if (f.kind !== 'supplierAnswers') continue;
          const p = f.payload as { answers: AnswerInput[]; hon: HonInput[] };
          if (p.answers.length) mergeOrders(await api.answerOrders(p.answers));
          if (p.hon.length) mergeOrders(await api.approveHon(p.hon));
        }
      }} />
  );
}
