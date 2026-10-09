'use client';

import type { ReactNode } from 'react';
import { DEMO } from '@/lib/demo';
import { BILL_LEAD, CAMPAIGN_DISCOUNT, PAY_CYCLE, TERMS_URL, VM_ESTIMATE_NOTE } from '@/lib/corp/docs/apply/data';
import {
  addrText, applicantCands, discWho, dText, eqText, inclText, mainStaff, ngText, patternOf, planOf, quoteAll, quoteOf, svcText, termOf, yen,
} from '@/lib/corp/docs/apply/logic';
import type { ApplyBranch, ApplyState, Staff } from '@/lib/corp/docs/apply/types';
import { esc, H } from './parts';
import { corpTerm } from '@/lib/domain/terms';

/* 確認画面（元の applyStepConfirm・cfmRender）。表の中身は元と同じく HTML の文字列（入力値は esc で逃がす） */

export type CfmView = 'card' | 'table' | 'acc' | 'sum';
const CFM_VIEWS: { v: CfmView; t: string; d: string }[] = [
  { v: 'card', t: 'カード型', d: '項目をグリッドで並べます。いまの形です。画面が広いときに読みやすい。' },
  { v: 'table', t: '表型', d: '1項目1行の表。上から順に読み合わせる・印刷する使い方に向きます。' },
  { v: 'acc', t: 'アコーディオン型', d: '拠点ごとに折りたたみます。<b>拠点が多いとき</b>に全体が見渡せます。' },
  { v: 'sum', t: '要点＋詳細', d: '上に要点だけ出し、詳細は畳みます。ざっと確かめて送りたい方向け。' },
];

/** 値がなければ「未入力」 */
const vv = (v: unknown) => {
  const t = (v == null ? '' : String(v)).trim();
  return t ? t : '<span class="unset">未入力</span>';
};
const kindCls = (k?: string) => (k === 'メイン担当者' ? 'blue' : k === '請求担当者' ? 'grn' : 'mut');

type Sec = {
  no: string; title: string; sub?: string;
  rows?: [string, string][];
  before?: ReactNode; after?: ReactNode;
  edit?: () => void; editLabel?: string;
  plain?: boolean;
};

export type ConfirmProps = {
  A: ApplyState;
  view: CfmView;
  open: Record<number, boolean>;
  brCol: boolean;
  whoBad: boolean;
  agBad: boolean;
  onView: (v: CfmView) => void;
  onBrCol: (on: boolean) => void;
  onAcc: (i: number) => void;
  onGoto: (step: 1 | 2, bi?: number) => void;
  onWho: (mail: string) => void;
  onAgree: (on: boolean) => void;
};

export function Confirm(P: ConfirmProps) {
  const { A, view: v } = P;
  const c = A.corp, isT = A.kind === 'trial', all = quoteAll(A);
  const optSum = A.branches.reduce((t, b) => { const q = quoteOf(b); return t + (q.byQuote ? 0 : q.opt); }, 0);

  /* お見積料金内訳 */
  const est = (
    <div className="card estc">
      <h2>
        お見積料金内訳（税抜）
        <span className="r"><span className="el">月額基本料金合計（税抜）</span><span className="ev">{all.n ? yen(all.net) : '—'}<span> / 月</span></span></span>
      </h2>
      <div className="pad">
        <div className="erow">
          <span>基本プラン合計（{all.n}契約）</span><b>{all.n ? yen(all.sum - optSum) : '—'}</b>
          <span>オプション合計</span><b>{yen(optSum)}</b>
          {isT && <><span>キャンペーン割引（{discWho(A)}に1回）</span><b style={{ color: '#C02339' }}>{all.discount ? '−' + yen(all.discount) : '—'}</b></>}
        </div>
        {!!all.nq && (
          <div className="note warn" style={{ marginBottom: 0 }}>
            <b>自動販売機の契約 {all.nq}件は別途お見積りです。</b>上の合計には含まれていません。内容を確認のうえ、担当者よりご連絡します。
          </div>
        )}
        <div className="note ok" style={{ marginBottom: 0 }}>
          <b>プランに含まれる設備（冷蔵庫・資材ボックスなど）は無料貸し出しです。</b>台数とサイズはご契約のプランで決まります。上の金額は<b>追加でご希望いただいた設備</b>とその他オプションの分です。
        </div>
        <div className="note mut" style={{ marginBottom: 0 }}>
          ※ 上記金額は概算お見積りです。<b>初期費用・設置代行（税込 22,000円）はESキッチンが設定します。</b>正式な初回請求料金は、搬入経路・オプション条件をESキッチン担当者が最終確認のうえ、契約締結時に確定いたします。
        </div>
      </div>
    </div>
  );

  /* 契約（拠点）— 行＝項目／列＝拠点 */
  const items: { l: string; f: (b: ApplyBranch) => string }[] = [
    { l: '契約区分', f: () => (isT ? 'お試しキャンペーン' : '本導入') },
    { l: '設備タイプ', f: (b) => (b.dev === 'vm' ? '<b>自動販売機</b>' : '冷蔵庫・冷凍庫') },
    { l: '希望プラン', f: (b) => esc(planOf(b).name) },
    { l: 'コース', f: (b) => esc(b.course || '') },
    { l: '配送方法', f: (b) => esc(corpTerm(b.ship || '')) },
    { l: 'お届け回数', f: (b) => esc(dText(b)) },
    { l: '消費期限の短い商品（サラダなど）の扱い', f: (b) => esc(patternOf(b)) },
    { l: '契約開始希望年月', f: (b) => (isT ? '—（お試しはESキッチンが調整）' : b.start ? '<b>' + esc(b.start) + '</b>' : '') },
    {
      l: '契約期間（最低利用期間）', f: (b) => {
        if (isT) return 'なし';
        const t = termOf(b);
        return t ? '<b>' + t + 'ヶ月</b>　<span class="mm">いちばん長い設備の代表値</span>' : 'なし';
      },
    },
    { l: '設置フロア', f: (b) => esc(b.floor || '') },
    { l: 'プランに含まれる設備', f: (b) => esc(inclText(b)) },
    { l: '追加でご希望の設備', f: (b) => esc(eqText(b)) },
    { l: 'その他オプション', f: (b) => esc(svcText(b)) },
    { l: 'プラン外の備考', f: (b) => esc(b.note || '') },
    { l: 'プラン料金合計', f: (b) => { const q = quoteOf(b); return q.byQuote ? '<b style="color:#8A5A00">別途見積</b>' : '<b>' + yen(q.total) + ' / 月</b>' + (b.dev === 'vm' ? '（目安）<br><span style="font-size:12px;color:#8A5A00">' + VM_ESTIMATE_NOTE + '</span>' : ''); } },
    { l: 'お届け先住所', f: (b) => esc(addrText(b)) },
    { l: '電話番号', f: (b) => esc(b.tel || '') },
    { l: '従業員数概算', f: (b) => esc(b.emp || '') },
    { l: '請求書', f: (b) => esc(b.bill || '') },
    { l: '支払い方法', f: (b) => esc(b.bill === 'この拠点に請求' ? b.pay || '' : '法人の支払い方法') },
    { l: 'お支払いの周期（月払い・年払い）', f: (b) => esc(b.bill === 'この拠点に請求' ? b.cycle || PAY_CYCLE[0] : '法人のお支払いの周期（月払い・年払い）') },
    { l: 'お届けできない曜日', f: (b) => esc(ngText(b)) },
    { l: 'お届けできない日になった場合', f: (b) => esc(b.ngmove || '') },
    { l: '搬入経路・添付資料', f: (b) => (b._files || []).map((f) => esc(f.n) + '（' + esc(f.s) + '）').join('<br>') },
    {
      l: '拠点のご担当者', f: (b) => {
        if (!b._same) return staffCell(b._st);
        const m = mainStaff(A.corp);
        return m && String(m.name || '').trim()
          ? '<span class="bg mut">法人の担当者と同じ</span><br><b>' + esc(m.name) + '</b>' + (m.mail ? '<br><span class="mm">' + esc(m.mail) + '</span>' : '') + (m.tel ? '<br><span class="mm">' + esc(m.tel) + '</span>' : '')
          : '<span class="bg mut">法人の担当者と同じ</span><br>' + vv('');
      },
    },
  ];

  const secs: Sec[] = [];
  const useCol = v === 'table' && P.brCol && A.branches.length > 1;
  if (useCol) {
    secs.push({
      no: '1', title: 'ご契約プラン・お届け先・添付資料一覧', sub: A.branches.length + '契約を横に並べています', plain: true,
      after: <Matrix A={A} items={items} onGoto={P.onGoto} />,
    });
  } else {
    A.branches.forEach((b, i) => {
      secs.push({
        no: '希望プラン ' + (i + 1), title: b.name || '契約 ' + (i + 1),
        sub: [esc(b.pref || ''), esc(planOf(b).name), b.dev === 'vm' ? '自動販売機' : '冷蔵庫・冷凍庫'].filter(Boolean).join('　／　'),
        edit: () => P.onGoto(1, i), editLabel: 'この契約を修正',
        rows: items.map((it) => [it.l, it.f(b)]),
      });
    });
  }
  secs.push({
    no: '2', title: '法人情報・担当者', edit: () => P.onGoto(2),
    before: <div className="secttl" style={{ marginTop: 0 }}>法人情報</div>,
    rows: [
      ['法人名', esc(c.name)], ['法人名フリガナ', esc(c.kana)], ['請求先法人名', esc(c.billname)],
      ['本店所在地（住所）', esc(addrText(c))],
      ['代表電話番号', esc(c.tel)], ['FAX番号', esc(c.fax || '')], ['支払い方法', esc(c.pay)],
      ['お支払いの周期（月払い・年払い）', esc(c.cycle || PAY_CYCLE[0])], ['請求書の発行時期', esc(c.lead || BILL_LEAD[0])],
    ],
    after: (
      <>
        <div className="secttl">ご担当者</div>
        <CfmStaff rows={c._st || []} />
        <div className="secttl">お申し込み者（ご担当者から選ぶ）</div>
        <ApplicantBox A={A} bad={P.whoBad} onPick={P.onWho} />
      </>
    ),
  });
  /* お試しは利用規約・プライバシーポリシー・キャンペーン規約の3つとも（1つのチェック：台帳 2026/10/03） */
  const lk = (href: string, t: string) => <a href={href || undefined} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', textDecoration: 'underline' }}>{t}</a>;
  const agreeLabel = isT
    ? <>{lk(TERMS_URL.terms, '利用規約')}・{lk(TERMS_URL.privacy, 'プライバシーポリシー（導入企業への購入実績の提供）')}・{lk(TERMS_URL.campaign, 'キャンペーン規約')} に同意します</>
    : <>{lk(TERMS_URL.terms, '利用規約')} および {lk(TERMS_URL.privacy, 'プライバシーポリシー（導入企業への購入実績の提供）')} に同意します</>;
  secs.push({
    no: '3', title: 'ご確認とご同意', plain: true,
    after: (
      <>
        {isT ? (
          <div className="note ok">
            <b>お試し期間中は、50プラン（ESライト）の月額 {yen(CAMPAIGN_DISCOUNT)} までを割引します</b>（{discWho(A)}に1回・その請求の月額合計が上限）。請求先が「法人に請求」なら法人の請求に1回、拠点ごとに請求する場合は一覧の最初の拠点だけに適用します。最低利用期間も違約金もありません。複数拠点・プラン変更・期間の延長は、差額をご請求します。
          </div>
        ) : (
          <div className="note warn"><b>最低利用期間があります。</b>ご契約の開始日から数えます。期間の途中で解約される場合、お使いの設備ごとに定めた金額をご精算いただきます。</div>
        )}
        <div className={`chkbox${A.agree ? ' on' : ''}${P.agBad ? ' err' : ''}`} id="agBox">
          <label><input type="checkbox" id="agChk" checked={A.agree} onChange={(e) => P.onAgree(e.target.checked)} /><span>{agreeLabel}</span></label>
        </div>
        <div id="agErr" className="cfmerr" style={{ display: P.agBad ? 'block' : 'none' }}>同意にチェックを入れてください。</div>
      </>
    ),
  });

  const sk = Array.from(new Set(A.branches.map((b) => b.start).filter(Boolean) as string[]));
  const head = [
    { l: '契約区分', v: isT ? '<b>お試しキャンペーン</b>' : '<b>本導入</b>' },
    { l: '契約数', v: '<b>' + A.branches.length + '契約</b>' },
    { l: '契約開始希望年月', v: isT ? '—' : sk.length === 0 ? vv('') : sk.length === 1 ? '<b>' + esc(sk[0]) + '</b>' : '<b>' + sk.length + '種類</b>' },
    { l: '月額基本料金合計（税抜）', v: '<b>' + (all.n ? yen(all.net) + '/月' : '—') + '</b>' + (all.nq ? '　＋別途見積 ' + all.nq + '件' : '') },
    { l: '法人', v: '<b>' + vv(esc(c.name)) + '</b>' },
  ];

  return (
    <>
      {est}
      {DEMO && <CfmSwitch v={v} nb={A.branches.length} brCol={P.brCol} onView={P.onView} onBrCol={P.onBrCol} />}
      <div className="cfmlead">以下の内容をご確認ください。修正が必要な場合は<b>「修正する」</b>ボタンで該当ステップに戻れます。</div>
      {v === 'sum' && (
        <div className="summ">
          {head.map((x, n) => <div key={n} className="si"><div className="sl">{x.l}</div><H as="div" className="sv" html={x.v} /></div>)}
        </div>
      )}
      {secs.map((sec, i) => {
        const body = (
          <>
            {sec.before}
            {sec.rows && (v === 'table' ? <CfmTable rows={sec.rows} /> : <CfmKv rows={sec.rows} />)}
            {sec.after}
          </>
        );
        if (sec.plain) return <CfmCard key={i} sec={sec} body={body} noEdit />;
        if (v === 'acc' || v === 'sum') {
          const open = P.open[i] !== undefined ? P.open[i] : v === 'acc' && i === 0;
          return (
            <div key={i} className={`accit${open ? ' open' : ''}`}>
              <div className="acch" onClick={() => P.onAcc(i)}>
                <span className="cno">{sec.no}</span>
                <span className="bn">{sec.title}</span>
                {sec.sub && <H className="ln" html={sec.sub} />}
                <span className="more">{open ? '閉じる ▲' : '内容を見る ▼'}</span>
              </div>
              <div className="accb">
                {body}
                {sec.edit && (
                  <div style={{ marginTop: '0.785714rem' }}>
                    <button type="button" className="btn sm" onClick={sec.edit}><span className="ico">✎</span>{sec.editLabel || '修正する'}</button>
                  </div>
                )}
              </div>
            </div>
          );
        }
        return <CfmCard key={i} sec={sec} body={body} />;
      })}
    </>
  );
}

function CfmCard({ sec, body, noEdit }: { sec: Sec; body: ReactNode; noEdit?: boolean }) {
  return (
    <div className="card cfm">
      <h2>
        <span className="cfmno">{sec.no || '確認'}</span>{sec.title}
        {sec.sub && <H className="sub" html={sec.sub} />}
        {!noEdit && sec.edit && (
          <span className="r"><button type="button" className="btn sm" onClick={sec.edit}><span className="ico">✎</span>{sec.editLabel || '修正する'}</button></span>
        )}
      </h2>
      <div className="pad">{body}</div>
    </div>
  );
}

function CfmKv({ rows }: { rows: [string, string][] }) {
  return (
    <div className="kv cfmkv">
      {rows.map(([k, val], n) => <div key={n}><div className="k">{k}</div><H as="div" className="v" html={vv(val)} /></div>)}
    </div>
  );
}
/** 1項目1行の表（表型）。読み合わせ・印刷に向く */
function CfmTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="scrollx">
      <table className="t cfmt">
        <tbody>
          {rows.map(([k, val], n) => <tr key={n}><th>{k}</th><td dangerouslySetInnerHTML={{ __html: vv(val) }} /></tr>)}
        </tbody>
      </table>
    </div>
  );
}

/** 行＝項目／列＝拠点 のマトリクス表。値が拠点で違う行には「拠点ごとに違う」を出す */
function Matrix({ A, items, onGoto }: { A: ApplyState; items: { l: string; f: (b: ApplyBranch) => string }[]; onGoto: ConfirmProps['onGoto'] }) {
  const many = A.branches.length > 1;
  return (
    <>
      <div className="scrollx">
        <table className="t cfmx">
          <thead>
            <tr>
              <th className="hd">項目</th>
              {A.branches.map((b, i) => (
                <th key={i}>
                  <div className="cn">希望プラン {i + 1}</div>
                  <div className="ct">{b.name || '契約 ' + (i + 1)}</div>
                  <div className="ce"><button type="button" className="btn sm" onClick={() => onGoto(1, i)}><span className="ico">✎</span>この契約を修正</button></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it, n) => {
              const vals = A.branches.map((b) => it.f(b));
              const diff = vals.some((x) => x !== vals[0]) && many;
              return (
                <tr key={n} className={diff ? 'dx' : undefined}>
                  <th className="hd">{it.l}{diff && <span className="dxb">拠点ごとに違う</span>}</th>
                  {vals.map((x, j) => <td key={j} dangerouslySetInnerHTML={{ __html: vv(x) }} />)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="note mut"><b>「拠点ごとに違う」</b>が付いている行が、契約によって内容が分かれているところです。</div>
    </>
  );
}

/** マトリクスのセルに入れる担当者（コンパクト） */
function staffCell(rows: Staff[] | undefined) {
  return (rows || []).map((r) =>
    '<div class="stc"><span class="bg ' + kindCls(r.kind) + '">' + esc(r.kind || '') + '</span> <b>' + esc(r.name || '') + '</b>'
    + (r.kana ? '<div class="mm">' + esc(r.kana) + '</div>' : '')
    + (r.mail ? '<div class="mm">' + esc(r.mail) + '</div>' : '')
    + (r.tel ? '<div class="mm">' + esc(r.tel) + '</div>' : '') + '</div>').join('');
}

function CfmStaff({ rows }: { rows: Staff[] }) {
  if (!rows.length) return <div className="note mut" style={{ margin: 0 }}>ご担当者が登録されていません。</div>;
  const cell = (x?: string) => <span dangerouslySetInnerHTML={{ __html: vv(esc(x)) }} />;
  return (
    <div className="scrollx">
      <table className="t">
        <thead><tr><th>区分</th><th>担当者名</th><th>フリガナ</th><th>メールアドレス</th><th>電話番号</th></tr></thead>
        <tbody>
          {rows.map((r, n) => (
            <tr key={n}>
              <td><span className={`bg ${kindCls(r.kind)}`}>{r.kind || ''}</span></td>
              <td><b>{cell(r.name)}</b></td><td>{cell(r.kana)}</td><td>{cell(r.mail)}</td><td>{cell(r.tel)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** お申し込み者（ご担当者の表に「お申し込み者」のラジオボタン） */
function ApplicantBox({ A, bad, onPick }: { A: ApplyState; bad: boolean; onPick: (mail: string) => void }) {
  const c = applicantCands(A);
  return (
    <div className={`fld${bad ? ' bad' : ''}`} id="whoFld">
      <div className="scrollx">
        <table className="t whot">
          <thead>
            <tr><th className="c" style={{ width: '8rem' }}>お申し込み者<span className="rq">必須</span></th><th>所属</th><th>区分</th><th>担当者名</th><th>メールアドレス</th></tr>
          </thead>
          <tbody>
            {c.map((x, n) => {
              const on = !!x.mail && A.who === x.mail;
              return (
                <tr key={n} className={on ? 'on' : ''} onClick={() => { if (!on) onPick(x.mail || ''); }}>
                  <td className="c">
                    <input type="radio" name="who" id={'who' + n} value={x.mail || ''} checked={on} onClick={(e) => e.stopPropagation()} onChange={() => onPick(x.mail || '')} aria-label={(x.name || '') + 'をお申し込み者にする'} />
                  </td>
                  <td>{x.where}</td>
                  <td><span className={`bg ${kindCls(x.kind)}`}>{x.kind}</span></td>
                  <td><b>{x.name}</b></td><td>{x.mail}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="er" id="whoErr">お申し込み者を選んでください。</div>
      <div className="note mut" style={{ marginBottom: 0 }}>
        お申し込み者は、前の画面でご入力いただいた<b>ご担当者から1名</b>お選びください（別にご入力いただく必要はありません）。<b>受付完了メールは、お申し込み者とメイン担当者の両方</b>へお送りします。一覧にいない方は、前の画面でご担当者に追加してください。
      </div>
    </div>
  );
}

/** 見せ方の切替（デモ用） */
function CfmSwitch({ v, nb, brCol, onView, onBrCol }: { v: CfmView; nb: number; brCol: boolean; onView: (v: CfmView) => void; onBrCol: (on: boolean) => void }) {
  let d = CFM_VIEWS.find((o) => o.v === v)?.d || '';
  const sub = v === 'table' && nb > 1;
  if (sub) {
    d += brCol
      ? '　／　<b>拠点を横に並べます。</b>まとめて申し込んだ拠点を見比べられます。拠点が増えると横スクロールになります。'
      : '　／　<b>拠点ごとに1枚ずつ表にします。</b>拠点が多くても横に広がりません。';
  }
  return (
    <div className="cfmsw">
      <span className="l">確認の見せ方 <span className="bg red">デモ用の切替・本番では出しません</span></span>
      {CFM_VIEWS.map((o) => <button key={o.v} type="button" className={`cfmb${v === o.v ? ' on' : ''}`} onClick={() => onView(o.v)}>{o.t}</button>)}
      {sub && (
        <>
          <span className="sep" /><span className="l">拠点の並べ方</span>
          <button type="button" className={`cfmb${brCol ? ' on' : ''}`} onClick={() => onBrCol(true)}>拠点ごとに列</button>
          <button type="button" className={`cfmb${brCol ? '' : ' on'}`} onClick={() => onBrCol(false)}>拠点ごとに表</button>
        </>
      )}
      <span className="n">
        <span dangerouslySetInnerHTML={{ __html: d }} />
        <br /><b>本番は表型に固定します</b>（件数では切り替えません（決定 v2.3 追補 2026-09-28））。スマートフォンは画面の幅に合わせて縦に並べます。
      </span>
    </div>
  );
}
