'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/*
 * AI チャットボット（HubSpot Phase 2・2026/10/02 決定）。法人Web の右下の丸いボタンから開く。
 * デモ：AI にはつないでいない。決まった質問と答え（下の QA）を出すだけ。言葉に合う答えがなければお問い合わせフォームへ案内する。
 * 本番は HubSpot のチャットボットに置き換える（会話の記録・CRM の同期は Phase 3）。
 */

type Msg = { from: 'bot' | 'me'; text: string; link?: { href: string; label: string } };
const QA: { q: string; keys: string[]; a: string; link?: Msg['link'] }[] = [
  { q: 'お届け日を変えたい', keys: ['お届け', '配送', '日付', '変更'], a: 'お届け日の変更は、ホームの「お届け予定」から便を選んで「お届け日の変更を申請」で申請できます（ご注文・変更の締切まで）。ESキッチンが確認してお返事します。', link: { href: '/corp', label: 'お届け予定を開く' } },
  { q: '商品の注文の締切は？', keys: ['注文', '締切', 'メニュー'], a: '月次注文の締切は、各ご利用月のメニュー公開から締切日まで（例：11月分は 10/15 まで）です。ご注文がない拠点は基準数でお届けします。', link: { href: '/corp/order', label: '商品注文を開く' } },
  { q: '請求書はどこで見られますか？', keys: ['請求', '請求書', '支払', 'Bill One'], a: '請求書（PDF）は Bill One（請求書のオンライン受け取りサービス）からメールでお届けします。内容（明細）と送付の状況は「請求書」の画面で確認できます。', link: { href: '/corp/bills', label: '請求書を開く' } },
  { q: '棚卸報告のやり方', keys: ['在庫', '点検', '棚卸'], a: '毎月の報告期限（20日）までに「棚卸報告」の画面で残っている数を報告してください。ES配送便の拠点はドライバーも報告しますが、最終確認として法人Webからも報告できます（最後の報告が有効）。', link: { href: '/corp/stock', label: '棚卸報告を開く' } },
  { q: '担当者に問い合わせたい', keys: ['問い合わせ', '担当', '電話', '相談'], a: 'お問い合わせフォームから送ってください。担当者からメールでお返事します。', link: { href: '/corp/contact', label: 'お問い合わせフォームへ' } },
];
const HELLO: Msg = { from: 'bot', text: 'こんにちは。ES STATION のサポートです。下の質問を選ぶか、聞きたいことを入れてください。' };


export default function CorpChatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([HELLO]);
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, open]);

  const answer = (q: string) => {
    const hit = QA.find((x) => x.q === q) ?? QA.find((x) => x.keys.some((k) => q.includes(k)));
    const bot: Msg = hit ? { from: 'bot', text: hit.a, link: hit.link }
      : { from: 'bot', text: 'すみません、その質問にはお答えできません（デモのため決まった質問だけに答えます）。お問い合わせフォームから送ってください。', link: { href: '/corp/contact', label: 'お問い合わせフォームへ' } };
    setMsgs((m) => [...m, { from: 'me', text: q }, bot]);
  };
  const send = () => { const q = text.trim(); if (!q) return; setText(''); answer(q); };

  return (
    <>
      {open && (
        <div className="es-chatbot" role="dialog" aria-label="AIチャットボット（デモ）">
          <div className="es-chatbot__head">
            <b>AIチャットボット <small>（デモ）</small></b>
            <button type="button" className="es-btn es-btn--ghost es-btn--neutral es-btn--sm es-btn--icon" onClick={() => setOpen(false)} aria-label="閉じる">×</button>
          </div>
          <div className="es-inline es-inline--warning">デモのため AI にはつないでいません。決まった質問にだけ答えます。</div>
          <div className="es-chatbot__body">
            {msgs.map((m, i) => (
              <div key={i} className={`es-chatbot__msg es-chatbot__msg--${m.from}`}>
                {m.text}
                {m.link ? <div><Link href={m.link.href} className="es-link" onClick={() => setOpen(false)}>{m.link.label} ›</Link></div> : null}
              </div>
            ))}
            <div ref={end} />
          </div>
          <div className="es-chatbot__chips">{QA.map((x) => <button key={x.q} type="button" className="es-btn es-btn--outline es-btn--primary es-btn--sm" onClick={() => answer(x.q)}>{x.q}</button>)}</div>
          <div className="es-chatbot__foot">
            <div className="es-input es-input--sm">
              <input value={text} placeholder="質問を入れてください" aria-label="質問" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) send(); }} />
            </div>
            <button type="button" className="es-btn es-btn--solid es-btn--primary es-btn--sm" onClick={send}>送信</button>
          </div>
        </div>
      )}
      <button type="button" className="es-chatbot__fab" aria-label={open ? 'チャットを閉じる' : 'AIチャットボットを開く'} title="AIチャットボット（デモ）" onClick={() => setOpen(!open)}>
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" aria-hidden="true"><path d="M5 7h22v15H13l-6 5v-5H5z" /><path d="M10 13h12M10 17h8" strokeLinecap="round" /></svg>
      </button>
    </>
  );
}
