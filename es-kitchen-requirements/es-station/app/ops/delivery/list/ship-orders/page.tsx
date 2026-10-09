'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DEMO } from '@/lib/demo';
import { useQuery } from '@/lib/ops/core/client';
import { useOps } from '../../../_ui/OpsProvider';
import { useCanAct } from '../../../_ui/perm';
import { api } from '../../_components/api';
import { downloadCsv, pickCsv, SHIP_CSV } from '../../_components/csv';
import { Badge, Button, Card, InlineMessage, PageHead, SectionTitle, Select, Tabs } from '../../_components/kit';
import { fmtDateTime } from '@/lib/format/date';

/*
 * 出荷指示・取込（部品 16 の ShipOrders）。出荷指示の送信（再送）と、出荷実績・送り状番号の CSV の取込。
 * CSV は見本の行を出力する（本番は Shift_JIS・列の順序は THOMAS から届くまで暫定）。
 */

const ST_TONE = { '再送待ち': 'warning', '送信済': 'success', '送信失敗': 'negative' } as const;

export default function Page() {
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const { data } = useQuery(api, 'shipOrders');
  const [tab, setTab] = useState<'send' | 'imp'>('send');
  const orders = data?.orders ?? [], invoices = data?.invoices ?? [], imports = data?.imports ?? [];

  const out = (key: string) => {
    /* 出荷指示（THOMAS）は配送の明細から作った中身（同梱資材・出荷時の特殊指示つき）。ほかは見本 */
    const o = key === 'thomas' && data?.thomasCsv?.rows.length ? data.thomasCsv : SHIP_CSV[key];
    downloadCsv(o.file, o.head, o.rows);
    toast(DEMO ? `「${o.file}」を出力しました（見本・${o.rows.length}行。実装は Shift_JIS）` : `「${o.file}」を出力しました`);
  };
  const resend = async (id: string) => {
    try { await api.action('resendShipOrder', { id }); toast('出荷指示を再送しました（新しい版）'); } catch (e) { toastError(e); }
  };
  const imp = async (kind: '出荷実績' | '送り状番号') => {
    const f = await pickCsv();
    if (!f) return;
    try {
      await api.action('recordImport', { file: f.name, kind, lines: f.lines });
      toast(`「${f.name}」を取り込みました（${kind} ${f.lines}行・エラー 0行）`);
    } catch (e) { toastError(e); }
  };

  return (
    <>
      <PageHead crumbs={['配送管理', '出荷・配送管理', '出荷指示・取込']} links={{ 1: '/ops/delivery/list' }} title="出荷指示・取込"
        stat={<><span>倉庫システム：トーマス（暫定の名前）</span><span className="k">出力</span><span>CSV ・ Shift_JIS（出力のときに変換）</span></>} />
      <Tabs items={[
        { value: 'send' as const, label: '出荷指示の送信', count: orders.filter((o) => o.st === '再送待ち').length },
        { value: 'imp' as const, label: '出荷実績・送り状の取込', count: imports.filter((x) => x.ng > 0).length },
      ]} value={tab} onChange={setTab} />
      {tab === 'send' && (
        <>
          <Card>
            <div className="dnav" style={{ marginTop: 0, flexWrap: 'wrap' }}>
              <Select label="倉庫" options={['関東倉庫 WH00001', '関西倉庫 WH00002']} defaultValue="関東倉庫 WH00001" style={{ width: '14.285714rem' }} />
              <Select label="対象" options={['出荷日 10/12〜10/25（A・B週・10/09 送信予定）', '出荷日 9/28〜10/11（C・D週・9/25 送信済）', '追加分（日次の拾い上げ・未送信）']} defaultValue="出荷日 10/12〜10/25（A・B週・10/09 送信予定）" style={{ width: '24.285714rem' }} />
              <div style={{ display: 'flex', gap: '0.571429rem', alignSelf: 'flex-end' }}>
                <Button icon="DownloadTray" onClick={() => out('thomas')}>出荷指示CSVを出力（THOMAS）</Button>
                <Button variant="outline" icon="DownloadTray" onClick={() => out('yamato')}>送り状用CSVを出力（ヤマト）</Button>
              </div>
            </div>
            <div className="note">出力は確認用・手動連携用です。CSVを出力しても locked にはなりません（locked になるのは送信に成功したときだけ）。文字コードは Shift_JIS（出力のときに変換）、列の順序・名前は THOMAS から届くまで暫定です。</div>
            <InlineMessage tone="info" title="取消は数量0の新しい版を再送して打ち消します">取消の専用の仕組みは使いません。列の順序・名前はトーマスから届いたら出力の部分だけ直します（いまは DEV §19.1 の最低限の項目）。</InlineMessage>
            <div className="es-table-wrap">
              <table className="es-table">
                <thead><tr><th>送信日時</th><th>対象</th><th>倉庫</th><th className="r">件数</th><th>版</th><th>種類</th><th>結果</th><th style={{ width: '7.857143rem', textAlign: 'center' }}>操作</th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className={o.st === '送信済' ? '' : 'att'}>
                      <td className={o.at === '未送信' ? 'muted' : ''}>{o.at}</td>
                      <td className={(o.targetIsDl ? 'es-mono ' : '') + 'w'}>{o.targetIsDl ? <Link href={`/ops/delivery/list/${o.target}`}>{o.target}</Link> : o.target}<span className="sub">{o.sub}</span></td>
                      <td>{o.wh}</td>
                      <td className="r es-num">{o.count}</td>
                      <td className="es-num">{o.ver}</td>
                      <td>{o.kind}</td>
                      <td><Badge tone={ST_TONE[o.st]}>{o.st}</Badge>{o.err && <span className="sub">{o.err}</span>}</td>
                      <td style={{ textAlign: 'center' }}>{o.st === '送信済'
                        ? <Button size="sm" variant="ghost" icon="DownloadTray" onClick={() => out(o.csv ?? 'thomas_sent')}>CSV</Button>
                        : canAct(api, 'resendShipOrder') && <Button size="sm" variant="outline" onClick={() => resend(o.id)}>再送</Button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="grid2">
            <Card>
              <SectionTitle>ESで採番する送り状（1次が委託の引き取り便）</SectionTitle>
              <div className="note">出荷指示の送信に成功した時点で、見込みの箱数ぶん作ります。出荷実績の箱数が違えば足りない分を足し、余った分は無効にします。追跡ページのリンクは出しません。</div>
              <div className="es-table-wrap">
                <table className="es-table compact">
                  <thead><tr><th>送り状番号</th><th>箱</th><th>作った時</th><th>状態</th></tr></thead>
                  <tbody>{invoices.map((x) => <tr key={x.no} className={x.cls}><td className="es-mono">{x.no}</td><td className="es-num">{x.box}</td><td>{x.made}</td><td><Badge tone={x.tone}>{x.st}</Badge></td></tr>)}</tbody>
                </table>
              </div>
            </Card>
            <Card>
              <SectionTitle>送り状用CSV（ヤマト）<Badge tone="warning">ヤマトへ確認待ちの暫定</Badge></SectionTitle>
              <div className="note">トーマスのCSVに欄が無いため、送り状用のCSVを別に出します。</div>
              <div className="es-table-wrap">
                <table className="es-table compact">
                  <tbody>
                    <tr><td>営業所止めの宛名</td><td>受け取りに行く委託配送会社（例：栄成ロジ）</td></tr>
                    <tr><td>記事欄</td><td>拠点名と配送No</td></tr>
                    <tr><td>お届け予定日</td><td>営業所に着く日（1次のリードタイムの参考値から）</td></tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
      {tab === 'imp' && (
        <Card>
          <div className="dnav" style={{ marginTop: 0, flexWrap: 'wrap' }}>
            {canAct(api, 'recordImport') && <>
              <Button icon="UploadTray" onClick={() => imp('出荷実績')}>出荷実績CSVを取り込む（THOMAS）</Button>
              <Button variant="outline" icon="UploadTray" onClick={() => imp('送り状番号')}>送り状番号CSVを取り込む</Button>
            </>}
            <span className="grow"></span>
            <Button variant="ghost" icon="DownloadTray" onClick={() => out('tpl_result')}>ひな形（出荷実績）</Button>
            <Button variant="ghost" icon="DownloadTray" onClick={() => out('tpl_tracking')}>ひな形（送り状番号）</Button>
          </div>
          <InlineMessage tone="info">出荷実績と送り状番号を取り込みます。取り込めなかった行は要確認の「取込エラー」に出ます。</InlineMessage>
          <div className="es-table-wrap">
            <table className="es-table">
              <thead><tr><th>取込日時</th><th>ファイル</th><th>種類</th><th className="r">行数</th><th className="r">成功</th><th className="r">エラー</th><th>結果</th><th style={{ width: '9.285714rem', textAlign: 'center' }}>操作</th></tr></thead>
              <tbody>
                {imports.map((x) => (
                  <tr key={x.id} className={x.ng ? 'att' : ''}>
                    <td>{fmtDateTime(x.at)}</td><td className="es-mono">{x.file}</td><td>{x.kind}</td>
                    <td className="r es-num">{x.lines}</td><td className="r es-num">{x.ok}</td><td className="r es-num">{x.ng}</td>
                    <td><Badge tone={x.tone}>{x.st}</Badge>{x.sub && <span className="sub">{x.sub}</span>}</td>
                    <td style={{ textAlign: 'center' }}>{x.errCsv && <Button size="sm" variant="ghost" icon="DownloadTray" onClick={() => out('errors')}>エラー行</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
