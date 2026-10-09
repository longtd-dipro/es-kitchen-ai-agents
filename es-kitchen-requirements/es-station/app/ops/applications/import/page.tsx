'use client';

import './import.css';
import CsvImportScreen from '../../_ui/CsvImportScreen';
import { csvApi, saveCsv } from '@/components/csv/api';
import { setFilter } from '../_components/api';

/** 新規申込CSV取込（画面。1行＝1拠点・同じ法人キーの行が1つの申込。取り込むと「受付中」の申込ができる） */
export default function Page() {
  const download = async (e: React.MouseEvent) => {
    e.preventDefault();
    const t = await csvApi.template('newApplications');
    saveCsv(t.fileName, [t.head, ...t.rows]);
  };
  return (
    <CsvImportScreen
      entity="newApplications" title="新規申込CSV取込" listTitle="契約申請管理" crumb0="契約申請管理" listUrl="/ops/applications" newOnly
      onDone={() => setFilter({ tab: 'new', q: '', sort: 'date' })}
      desc={<>1行＝1拠点です。<b>法人キーが同じ行は1つの申込</b>（複数拠点）になり、法人・申込の列は最初の行に入れます。法人ID を入れると今ある法人に拠点を足します。切替（お試し→本導入）は画面で受けます。登録すると「受付中」の申込ができ、受付の画面で仮登録 → 本登録に進めます。</>}
      descMore={<>列は<a href="#" className="lnk" onClick={download}>テンプレート（CSV）</a>と同じです（見出しの【】の注記は外してかまいません）。添付ファイルは CSV で送れません。登録後に申請詳細で添付してください。</>}
    />
  );
}
