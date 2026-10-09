'use client';

import type { DeliveryNoteData } from '@/lib/corp/delivery/note';

/*
 * 便ごとの納品書（版1.1・CW_DLV No.25〜25.9・台帳 E「納品書のテンプレート（法人Web・PDF）」）。
 * A4 縦・1便＝1通。ブラウザの印刷（window.print・@media print）で PDF にする。見た目は delivery.css の .dn-*。
 * 上から 見出し（25.1）／宛先（25.2）・発行元（25.3）／お届け日・温度帯・お届け方法（25.4）／明細（25.5）／数量の合計（25.6）／注記（25.7）／ページ番号（25.8）。
 * 金額（単価・金額・税）は載せない（25.9）。明細が1ページに収まらないときは改ページし、見出しの行（thead）を各ページに繰り返す。
 */
export default function DeliveryNote({ n }: { n: DeliveryNoteData }) {
  /* 宛先の拠点名：法人名で始まる拠点名（「株式会社サンプル 大阪支店」）は法人名の行と重ならないよう後ろだけにする（CW_DLV No.25.2） */
  const rest = n.siteName.startsWith(n.corpName) ? n.siteName.slice(n.corpName.length).trim() : n.siteName;
  const site = rest || '本社';
  return (
    <article className="dn" aria-label={`納品書 ${n.id}`}>
      <header className="dn-head">
        <div className="dn-to">
          <div className="dn-corp">{n.corpName}</div>
          <div className="dn-site">{site} 御中</div>
          <div className="dn-addr">{n.address}</div>
        </div>
        <h1 className="dn-title">納品書</h1>
        <div className="dn-meta">
          <div><span>発行日</span><b>{n.issuedOn}</b></div>
          <div><span>納品書番号</span><b className="es-mono">{n.id}</b></div>
          <div className="dn-issuer">
            <b>{n.issuer.name}</b>
            <span>{n.issuer.address}</span>
            <span>TEL {n.issuer.tel}</span>
          </div>
        </div>
      </header>

      <div className="dn-info">
        <div><span>{n.dateLabel}</span><b>{n.date}</b></div>
        <div><span>温度帯・お届け方法</span><b>{n.kindText}</b></div>
        <div><span>ご利用月</span><b>{n.cycle}</b></div>
      </div>

      <table className="dn-table">
        <thead>
          <tr><th className="dn-no">No</th><th>商品名</th><th className="dn-num">ご注文数（個）</th><th className="dn-num">お届け数（個）</th><th className="dn-note">備考</th></tr>
        </thead>
        <tbody>
          {n.rows.map((r) => (
            <tr key={r.no}>
              <td className="dn-no">{r.no}</td>
              <td>{r.name}{r.nameEn ? <div className="dn-en">{r.nameEn}</div> : null}</td>
              <td className="dn-num">{r.ordered}</td>
              <td className={`dn-num${r.short ? ' dn-short' : ''}`}>{r.delivered === null ? '—' : r.delivered}</td>
              <td className="dn-note">{r.note}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><th colSpan={2}>合計</th><th className="dn-num">{n.totalOrdered}</th><th className="dn-num">{n.totalDelivered === null ? '—' : n.totalDelivered}</th><th /></tr>
        </tfoot>
      </table>

      {n.notes.length > 0 && (
        <ul className="dn-notes">{n.notes.map((t, i) => <li key={i}>{t}</li>)}</ul>
      )}
    </article>
  );
}
