'use client';

import { CAMPAIGN_DISCOUNT, VM_ESTIMATE_NOTE } from '@/lib/corp/docs/apply/data';
import { discWho, dText, num, planOf, quoteAll, quoteOf, yen } from '@/lib/corp/docs/apply/logic';
import type { ApplyState } from '@/lib/corp/docs/apply/types';
import { corpTerm } from '@/lib/domain/terms';

const Qr = ({ l, v }: { l: string; v: string }) => <div className="qr"><span>{l}</span><b>{v}</b></div>;

/** 右サイドのお見積（開いている契約の分と、お申し込み全体）。スマホは操作バーの「お見積」からシートで開く */
export function QuotePanel({ A }: { A: ApplyState }) {
  let i = A.branches.findIndex((b) => b._o);
  if (i < 0) i = 0;
  const b = A.branches[i], q = quoteOf(b), p = planOf(b), all = quoteAll(A);
  const isT = A.kind === 'trial';
  return (
    <div className="qpanel">
      <h3>プラン概要</h3>
      <div className="qsub">希望プラン {i + 1}　{b.name || '（未入力）'}</div>
      <div className="qtbl">
        <Qr l="プラン" v={p.name} />
        <Qr l="コース" v={b.course || '—'} />
        <Qr l="利用人数目安" v={p.people} />
        <Qr l="お届け回数" v={dText(b)} />
        <Qr l="配送方法" v={corpTerm(b.ship) || '—'} />
        <Qr l="設備タイプ" v={b.dev === 'vm' ? '自動販売機' : '冷蔵庫・冷凍庫'} />
      </div>
      <div className="qincl">
        <div className="qih">プランに含まれる設備<span className="bg grn">無料</span></div>
        {q.incl.map((l, n) => (
          <div key={n}>
            <span>{l.l}{l.up && <i>サイズ差額（標準 {l.base}）</i>}</span>
            <b className={l.v ? 'up' : undefined}>{l.v ? '+' + yen(l.v) : '0円'}</b>
          </div>
        ))}
      </div>
      <h3 style={{ marginTop: '1.142857rem' }}>お支払い明細<span className="qb2">この契約</span></h3>
      <div className="qtbl">
        <Qr l="プラン小計" v={q.byQuote && b.dev === 'vm' ? '—' : yen(q.plan)} />
        <Qr l="オプション小計" v={yen(q.opt)} />
      </div>
      {!!q.lines.length && (
        <div className="qlines">
          {q.lines.map((l, n) => <div key={n}><span>{l.l}</span><b>{l.v === null ? (l.once ? '初回' : '別途見積') : yen(l.v)}</b></div>)}
        </div>
      )}
      <div className="qtot">
        {q.byQuote ? (
          <><div className="ql">見積合計</div><div className="qv byq">別途見積</div><div className="qn2">※後日担当者より個別にご連絡いたします。</div></>
        ) : (
          <><div className="ql">見積合計{b.dev === 'vm' && '（目安）'}</div><div className="qv">{num(q.total)}<span>円/月</span></div>{b.dev === 'vm' && <div className="qn2">{VM_ESTIMATE_NOTE}</div>}</>
        )}
      </div>
      {(A.branches.length > 1 || isT) && (
        <>
          <h3 style={{ marginTop: '1.142857rem' }}>お申し込み全体<span className="qb2">{A.branches.length}契約</span></h3>
          <div className="qtbl">
            <Qr l={'小計（' + all.n + '契約）'} v={all.n ? yen(all.sum) : '—'} />
            {isT && <Qr l={'キャンペーン割引（' + discWho(A) + 'に1回）'} v={all.discount ? '−' + yen(all.discount) : '—'} />}
          </div>
          <div className="qtot sm">
            <div className="ql">月額合計（税抜）</div>
            <div className="qv">{all.n ? num(all.net) : '—'}<span>円/月</span></div>
            {!!all.nq && <div className="qn2">＋ <b>自動販売機 {all.nq}契約は別途見積</b></div>}
          </div>
          {isT && (
            <div className="qnote">
              <b>キャンペーン割引は1回だけ</b>です。50プラン（ESライト）の月額（{yen(CAMPAIGN_DISCOUNT)}）が上限です。
              {all.discTo === 'first'
                ? <>すべて「この拠点に請求」の契約なので、<b>一覧の最初の拠点だけ</b>に適用します（その拠点の月額が上限）。</>
                : <>請求先が「法人に請求」の契約があるので、<b>法人の請求に1回</b>適用します（法人あての契約の月額合計が上限）。</>}
              超えた分は差額をご請求します。
            </div>
          )}
        </>
      )}
      <div className="qnote">
        税抜の概算お見積りです。サイズ差額は、標準より大きいサイズのときだけ加算します（マイナスのときは0円として扱い、ご請求も返金もしません）。<b>初期費用・設置代行（税込 22,000円）はESキッチンが設定します。</b>正式な金額は、搬入経路・オプション条件を担当者が最終確認のうえ確定します。
      </div>
    </div>
  );
}

