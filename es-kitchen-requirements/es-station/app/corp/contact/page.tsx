'use client';

import { useState } from 'react';
import notice from '@/lib/domain/areas/notice';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import { errorMessage } from '@/lib/api/errors';
import type { Inquiry } from '@/lib/domain/types';
import { fmtDateTime } from '@/lib/format/date';
import { useLeaveGuard } from '@/lib/ui/leaveGuard';
import { useCorpSignedIn } from '../_ui/CorpProvider';
import { Badge, Button, Card, InlineMessage, Page, PageHead, SectionTitle } from '../_delivery/kit';

/*
 * お問い合わせ（HubSpot Phase 2・2026/10/02 決定）。送ると HubSpot に登録されたことにする（デモは外部に送らない。共通データ notice.sendInquiry）。
 * 返事は HubSpot からメールで届く。CRM の同期は Phase 3。
 */
const api = domainApi(notice);
const CATS = ['ご契約・お申し込み', '配送・お届け', '商品・メニュー', '請求・お支払い', 'アプリ・自販機', 'その他'];
type Form = { name: string; email: string; tel: string; category: string; subject: string; body: string };
const BLANK: Form = { name: '', email: '', tel: '', category: '', subject: '', body: '' };

export default function CorpContactPage() {
  const { account } = useCorpSignedIn();
  const [f, setF] = useState<Form>(BLANK);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<Inquiry | null>(null);
  const { data: hist } = useDomainQuery(api, 'inquiries', { corpId: account.corpId });
  const mine = (hist ?? []).filter((x) => account.role !== 'branch' || x.branchId === account.branchId);
  const up = (k: keyof Form) => (v: string) => setF({ ...f, [k]: v });
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：何か入れたまま送っていないとき（サイドメニュー・ブラウザを閉じる） */
  useLeaveGuard(!sent && Object.values(f).some((v) => !!v));

  const send = async () => {
    setBusy(true); setErr('');
    try {
      const out = await api.action('sendInquiry', { corpId: account.corpId, branchId: account.branchId, accountId: account.loginId, ...f });
      setSent(out); setF(BLANK);
    } catch (e) { setErr(errorMessage(e)); } finally { setBusy(false); }
  };

  const input = (k: keyof Form, label: string, req: boolean, ph = '', type = 'text') => (
    <div className="es-field">
      <label className="es-field__label" htmlFor={`iq-${k}`}>{label}{req ? <span className="es-field__req" aria-hidden>*</span> : null}</label>
      <div className="es-input es-input--md"><input id={`iq-${k}`} type={type} value={f[k]} placeholder={ph} onChange={(e) => up(k)(e.target.value)} /></div>
    </div>
  );

  return (
    <Page>
      <PageHead crumbs={['お問い合わせ']} title="お問い合わせ" sub="ESキッチンのサポート窓口へのお問い合わせです。内容を確認して、担当者からメールでお返事します。" />
      {sent ? (
        <InlineMessage tone="success" title="送信しました">
          お問い合わせ（受付番号 {sent.hubspotId}）を受け付けました。担当者からメール（{sent.email}）でお返事します。
          <div style={{ marginTop: '0.571429rem' }}><Button variant="outline" tone="neutral" size="sm" onClick={() => setSent(null)}>続けて問い合わせる</Button></div>
        </InlineMessage>
      ) : (
        <Card>
          <SectionTitle>お問い合わせの内容</SectionTitle>
          <div className="es-formgrid">
            {input('name', 'お名前', true, '例：山田 花子')}
            {input('email', 'メールアドレス（お返事の宛先）', true, '例：hanako@example.co.jp', 'email')}
            {input('tel', '電話番号', false, '例：03-1234-5678', 'tel')}
            <div className="es-field">
              <label className="es-field__label" htmlFor="iq-cat">お問い合わせの種類<span className="es-field__req" aria-hidden>*</span></label>
              <div className="es-input es-select es-input--md">
                <select id="iq-cat" value={f.category} onChange={(e) => up('category')(e.target.value)}>
                  <option value="" disabled>選んでください</option>
                  {CATS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="es-formgrid" style={{ gridTemplateColumns: '1fr', marginTop: '0.857143rem' }}>
            {input('subject', '件名', true, '例：請求書の宛名の変更について')}
            <div className="es-field">
              <label className="es-field__label" htmlFor="iq-body">内容（2000文字まで）<span className="es-field__req" aria-hidden>*</span></label>
              <div className="es-input es-input--md es-input--area">
                <textarea id="iq-body" rows={6} maxLength={2000} value={f.body} onChange={(e) => up('body')(e.target.value)} />
              </div>
              <p className="es-field__msg">{f.body.length}/2000</p>
            </div>
          </div>
          {err ? <InlineMessage tone="negative">{err}</InlineMessage> : null}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.571429rem', marginTop: '0.857143rem' }}>
            <Button disabled={busy} onClick={send}>{busy ? '送信中…' : '送信する'}</Button>
          </div>
          <p className="note" style={{ marginTop: '0.571429rem' }}>デモ：お問い合わせは HubSpot に送ったことにして記録だけを残します（実際には送りません）。</p>
        </Card>
      )}
      <Card>
        <SectionTitle>これまでのお問い合わせ</SectionTitle>
        {mine.length ? (
          <div className="es-table-wrap">
            <table className="es-table">
              <thead><tr><th style={{ width: '12.142857rem' }}>送信日時</th><th style={{ width: '10.714286rem' }}>受付番号</th><th style={{ width: '10.714286rem' }}>種類</th><th>件名</th><th style={{ width: '10.714286rem' }}>状態</th></tr></thead>
              <tbody>{mine.map((x) => (
                <tr key={x.id}><td className="es-num">{fmtDateTime(x.at)}</td><td className="es-mono">{x.hubspotId}</td><td>{x.category}</td><td>{x.subject}</td>
                  <td><Badge tone="success">送信しました</Badge></td></tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p className="note">まだお問い合わせはありません。</p>}
      </Card>
    </Page>
  );
}
