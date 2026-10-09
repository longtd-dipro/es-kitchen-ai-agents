'use client';

import { useEffect, useState } from 'react';
import { api, type Manual } from '@/lib/api/supplier';
import { useSupplier } from '@/lib/supplier/store';
import { useDownload } from '../../_components/useDownload';
import { Icon, PageHead } from '../../_components/ui';
import { fmtDate } from '@/lib/format/date';

/** S09 操作マニュアル */
export default function ManualPage() {
  const { toastError } = useSupplier();
  const download = useDownload();
  const [items, setItems] = useState<Manual[] | null>(null);
  useEffect(() => {
    api.listManuals().then(setItems).catch((e) => { toastError(e); setItems([]); });
  }, [toastError]);

  return (
    <>
      <PageHead crumbs={['操作マニュアル']} title="操作マニュアル" />
      <div className="card">
        {items === null && <div className="empty">読み込み中…</div>}
        {items?.length === 0 && <div className="empty">マニュアルはありません</div>}
        {items?.map((m) => (
          <div className="manual-item" key={m.file}>
            <div className="pdf">PDF</div>
            <div className="t"><b>{m.title}</b><div className="muted">{m.version}｜更新日 {fmtDate(m.updatedAt)}</div></div>
            <button className="btn sm out" onClick={() => download(m.file)}><Icon name="down" />ダウンロード</button>
          </div>
        ))}
      </div>
    </>
  );
}
