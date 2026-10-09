'use client';

import { useParams, useRouter } from 'next/navigation';
import { Fragment, type ReactNode } from 'react';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import reviews from '@/lib/ops/areas/reviews';
import { EsIcon } from '../_components/EsIcon';
import { Crumbs, DeadLink, LeftBadge, Nick, None, Stars, Tag } from '../_components/parts';
import { fmtDateTime } from '@/lib/format/date';

/*
 * レビュー詳細（部品/17_運営_レビュー.html の「詳細」）。投稿情報（3カラム）・評価した商品・コメント。
 * URL の id＝注文番号（レビューIDは持たない：hong 2026-10-05）。ユーザーID・法人・拠点・商品ID のリンクは、元でもどこへも飛ばない（見た目だけ）。注文番号は文字だけ。
 */

const api = areaApi(reviews);

/** 読み取り専用の項目（元の it()） */
function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="es-field">
      <span className="es-field__label">{label}</span>
      <div className="es-input es-input--readonly"><div className="v">{children}</div></div>
    </div>
  );
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: r, loading } = useQuery(api, 'detail', { id });
  const back = () => router.push('/ops/reviews');

  return (
    <section>
      <header className="es-pagehead">
        <div className="es-pagehead__text">
          <Crumbs items={[{ label: 'レビュー一覧', href: '/ops/reviews' }, { label: 'レビュー詳細' }]} />
          <h1 className="es-pagehead__title">レビュー詳細<span className="es-mono">{r ? ` ${r.order}` : ''}</span></h1>
        </div>
        <div className="es-pagehead__actions">
          <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--md" onClick={back}><EsIcon n="CaretLeft" />一覧へ戻る</button>
        </div>
      </header>
      <div className="es-shell__content">
        {!r ? (
          !loading && <section className="es-card"><div className="rv-none">レビュー（{id}）が見つかりません</div></section>
        ) : (
          <>
            <section className="es-card">
              <div className="es-section-title"><h2>投稿情報</h2></div>
              <div className="fgrid">
                <Item label="注文番号"><span className="es-mono">{r.order}</span></Item>
                <Item label="投稿日時"><span className="es-num">{fmtDateTime(r.dt)}</span></Item>
                <Item label="評価した商品数">{r.items.length}品</Item>
                <Item label="ユーザーID"><DeadLink>{r.user.uid}</DeadLink></Item>
                <Item label="ニックネーム"><Nick nick={r.user.nick} />{r.user.left && <> <LeftBadge /></>}</Item>
                <Item label="法人"><DeadLink>{r.co.id}</DeadLink>　{r.co.name}</Item>
                <Item label="拠点"><DeadLink>{r.br.id}</DeadLink>　{r.br.name}</Item>
                <Item label="最低評価"><Stars s={r.min} /></Item>
              </div>
            </section>
            <section className="es-card">
              <div className="es-section-title"><h2>評価した商品 <span className="rv-sub" style={{ display: 'inline', fontWeight: 400 }}>{r.items.length}品</span></h2></div>
              <div className="es-table-wrap">
                <table className="es-table rv-table" style={{ minWidth: '51.428571rem' }}>
                  <thead><tr><th style={{ width: '3.428571rem' }}>No</th><th style={{ width: '5.142857rem' }}>商品</th><th>商品ID</th><th>商品名</th><th>評価</th><th>評価タグ</th></tr></thead>
                  <tbody>
                    {r.items.map((x, i) => (
                      <tr key={x.pid}>
                        <td className="es-num">{i + 1}</td>
                        <td><div className="thumb" aria-hidden="true">{x.name.slice(0, 1)}</div></td>
                        <td className="nw"><DeadLink>{x.pid}</DeadLink></td>
                        <td>{x.name}</td>
                        <td className="nw"><Stars s={x.star} /></td>
                        <td>{x.tags.length ? x.tags.map((t, k) => <Fragment key={t}>{k > 0 && ' '}<Tag t={t} /></Fragment>) : <None />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section className="es-card">
              <div className="es-section-title"><h2>コメント（ご意見・ご要望）</h2></div>
              <div className="fgrid">
                <div className="es-field full">
                  <div className="es-input es-input--readonly">
                    <div className="v txt">{r.comment || <span className="rv-none">（コメントなし）</span>}</div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </section>
  );
}
