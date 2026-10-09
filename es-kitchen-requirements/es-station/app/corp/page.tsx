'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { DEMO } from '@/lib/demo';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import corpDelivery from '@/lib/corp/areas/corp-delivery';
import { today } from '@/lib/supplier/dates';
import { ymdW } from '@/lib/corp/delivery/logic';
import type { CalItem, HomeCell } from '@/lib/corp/delivery/types';
import { useCorpSignedIn } from './_ui/CorpProvider';
import { Badge, Button, Card, cx, EmptyState, EsIcon, InlineMessage, Loading, NoticeList, Page, PageHead, SectionTitle, useEsc, useWho } from './_delivery/kit';
import './_delivery/delivery.css';
import { fmtDate } from '@/lib/format/date';
import LoadError from './deliveries/_components/LoadError';
import RoBanner from './deliveries/_components/RoBanner';

/*
 * ホーム（CW_HOME 版1.1）：左＝今月のお届けのカレンダー、右＝お知らせ・「ご確認ください」（締切の警告＋決定 #58 の4種類）。
 * 左右は半々（1:1）が既定で、「広く／狭く」で 2:1 に切り替えられる（利用者ごとに localStorage に覚える・No.17）。
 * 法人アカウント＝自社のすべての拠点（拠点で絞り込み・マスの頭に拠点）、拠点アカウント＝その拠点だけ。
 * 同じ日に2件以上のお届けがあるマスは、その日のお届けの一覧（ポップオーバー）を出して選ぶ（Q-H2・No.14）。
 */
const api = areaApi(corpDelivery);
const KEY = 'corp.home';
/** 幅の切替（No.17）：ログインIDごとに localStorage に覚える */
const WIDTH_KEY = (login: string) => `corp.home.width:${login}`;
const NO_DETAIL = DEMO ? 'このお届けの詳細はデモでは省略しています' : 'このお届けの詳細はまだ表示できません';

/** その日のお届けの一覧（同じ日に2件以上あるとき・No.14）。外を押すか Esc で閉じる */
function DayPopover({ iso, items, onPick, onClose }: { iso: string; items: CalItem[]; onPick: (it: CalItem) => void; onClose: () => void }) {
  useEsc(onClose);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.es-calpop')) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  return (
    <div className="es-calpop" role="dialog" aria-label={`${ymdW(iso)} のお届け`} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <div className="es-calpop__head"><b>{ymdW(iso)} のお届け</b><button type="button" className="es-calpop__close" aria-label="閉じる" onClick={onClose}><EsIcon name="X" size={16} /></button></div>
      <ul className="es-calpop__list">
        {items.map((it, i) => (
          <li key={i}>
            <button type="button" className="es-calpop__item" onClick={() => onPick(it)}>
              <span className="es-calpop__line">{it.line.pre}<span className="es-calcell__v es-calcell__v--deliver">{it.line.value}</span>{it.line.post}</span>
              <span className="es-calpop__badges">{it.badges.map((b, j) => <Badge key={j} tone={b.tone} title={b.title} fixed>{b.label}</Badge>)}</span>
              <EsIcon name="CaretRight" size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Cell({ c, onClick, pop }: { c: HomeCell; onClick?: () => void; pop?: React.ReactNode }) {
  return (
    <div
      className={cx('es-calcell', c.today && 'is-today', onClick && 'is-clickable', !!pop && 'is-open', ...c.state.map((s) => 'es-calcell--' + s))}
      onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick(); } : undefined}
    >
      <div className="es-calcell__top">
        <span className="es-calcell__date">{c.date}</span>
        {c.holiday && <span className="es-calcell__hol">{c.holiday}</span>}
      </div>
      {c.cycle && <div className="es-calcell__cycle">{c.cycle}</div>}
      {c.lines.map((l, i) => <div key={i} className="es-calcell__line">{l.pre}<span className="es-calcell__v es-calcell__v--deliver">{l.value}</span>{l.post}</div>)}
      {c.badges.length > 0 && <div className="es-calcell__badges">{c.badges.map((b, i) => <Badge key={i} tone={b.tone} title={b.title} fixed>{b.label}</Badge>)}</div>}
      {pop}
    </div>
  );
}

export default function CorpHome() {
  const { account, isBranch, toast, view } = useCorpSignedIn();
  /* 解約後（参照のみ）：締切の警告・申請できる予定・申請の案内を出さない（サーバーにも ro を渡す。台帳 2026-10-05・受付簿 No.157） */
  const ro = view === 'ro';
  const who = useWho();
  const router = useRouter();
  const t = today().replace(/\//g, '-');
  const [ym, setYm] = useState(t.slice(0, 7));
  const [site, setSite] = useState('all');
  /* 幅（No.17）：既定は半々。「広く」でカレンダー側を 2:1 に */
  const [wide, setWide] = useState(false);
  /* 同じ日の一覧（ポップオーバー）を出しているマス */
  const [pop, setPop] = useState<string | null>(null);
  const closePop = useCallback(() => setPop(null), []);
  /* 見ていた月・拠点は、このタブの間だけ覚えておく（お届け詳細から戻ったとき用）。幅は利用者ごとに次回も使う */
  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as { ym?: string; site?: string; login?: string } | null;
      if (s && s.login === account.loginId) { if (s.ym) setYm(s.ym); if (s.site) setSite(s.site); }
    } catch { /* 使えないときは今月から */ }
    /* 「ご確認ください」のまとめた行から来たとき：そのお届けの月（?ym=）を開く */
    try { const q = new URLSearchParams(window.location.search).get('ym'); if (q && /^\d{4}-\d{2}$/.test(q)) setYm(q); } catch { /* 無視 */ }
    try { setWide(localStorage.getItem(WIDTH_KEY(account.loginId)) === 'wide'); } catch { setWide(false); }
  }, [account.loginId]);
  const remember = (v: { ym: string; site: string }) => { try { sessionStorage.setItem(KEY, JSON.stringify({ ...v, login: account.loginId })); } catch { /* 無視 */ } };
  const go = (v: { ym?: string; site?: string }) => { const n = { ym: v.ym ?? ym, site: v.site ?? site }; setYm(n.ym); setSite(n.site); remember(n); setPop(null); };
  const toggleWide = () => { const w = !wide; setWide(w); try { localStorage.setItem(WIDTH_KEY(account.loginId), w ? 'wide' : 'half'); } catch { /* 保存できないときは今回だけ */ } };

  const { data, error, reload } = useQuery(api, 'home', { ...who, ym, site, ro });
  const whoName = account.role === 'branch' ? `${account.corpName} ${account.branchName ?? ''}` : account.corpName;
  const scope = isBranch ? '拠点アカウント（この拠点のお届けだけ表示）' : '法人アカウント（自社のすべての拠点のお届けを表示）';

  const months = data?.months ?? [];
  const idx = months.indexOf(data?.ym ?? ym);
  const prev = () => (idx > 0 ? go({ ym: months[idx - 1] }) : toast('これより前のお届けはありません。'));
  const next = () => (idx >= 0 && idx < months.length - 1 ? go({ ym: months[idx + 1] }) : toast('これより先のお届けの予定はまだありません。'));
  const open = (go: string | null) => (go ? router.push(`/corp/deliveries/${go}?from=home`) : toast(NO_DETAIL));
  /* マスを押したとき：その日のお届けが1件なら詳細、2件以上なら一覧を出して選ぶ（Q-H2） */
  const onCell = (c: HomeCell) => (c.items.length >= 2 ? setPop(pop === c.iso ? null : c.iso) : open(c.go));

  const monthNav = (
    <div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}>
      {data && data.sites.length > 0 && (
        <div className="es-input es-select es-input--sm" style={{ minWidth: '10.714286rem' }}>
          <select value={data.site} aria-label="拠点で絞り込み" onChange={(e) => go({ site: e.target.value })}>
            {data.sites.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <EsIcon name="CaretDown" size={16} />
        </div>
      )}
      <Button variant="outline" size="sm" icon="CaretLeft" aria-label="前の月" onClick={prev} />
      <Button variant="outline" size="sm" icon="CaretRight" aria-label="次の月" onClick={next} />
      <Button variant="outline" size="sm" onClick={() => go({ ym: t.slice(0, 7) })}>今月</Button>
      {/* 幅の切替（No.17）：2列のときだけ（1列の狭い画面では CSS で隠す） */}
      <span className="home-width"><Button variant="outline" tone="neutral" size="sm" onClick={toggleWide} aria-label={wide ? 'カレンダーを狭くする' : 'カレンダーを広くする'}>{wide ? '狭く' : '広く'}</Button></span>
    </div>
  );

  return (
    <Page>
      <PageHead
        crumbs={['ホーム']}
        title="ホーム"
        stat={<><span>{whoName}</span><span className="k">権限</span><span>{scope}</span></>}
      />
      <RoBanner />
      {/* 切り替えのあとの最初の棚卸報告：報告するまで出す（受付簿 No.134） */}
      {data && data.firstStock.length > 0 && (
        <InlineMessage tone="warning" title="最初の棚卸報告をしてください">
          {(isBranch ? '' : data.firstStock.map((b) => b.name).join('・') + '：')}新しいシステムへの切り替えのあと、まだ棚卸報告をいただいていません。冷蔵庫・自販機にある商品の数を数えて、最初の棚卸報告をお願いします（ない商品は 0）。報告いただいた数が、在庫の始まりの数になります。報告をいただくまでは、管理ロスは計算しません。{' '}
          <a href="/corp/stock" className="es-link" onClick={(e) => { e.preventDefault(); router.push('/corp/stock'); }}>棚卸報告を開く</a>
        </InlineMessage>
      )}
      {!data ? (error ? <LoadError onRetry={reload} /> : <Loading />) : (
        <div className={cx('split', 'split--home', wide && 'split--home-wide')}>
          <Card>
            <SectionTitle action={monthNav}>{data.title}</SectionTitle>
            <div className="note">{data.note}</div>
            <div className="es-cal">
              {['月', '火', '水', '木', '金', '土', '日'].map((w) => <div key={w} className="es-cal__wd">{w}</div>)}
              {data.cells.map((c) => (
                <Cell key={c.iso} c={c} onClick={c.has ? () => onCell(c) : undefined}
                  pop={pop === c.iso && c.items.length >= 2 ? <DayPopover iso={c.iso} items={c.items} onPick={(it) => { setPop(null); open(it.go); }} onClose={closePop} /> : undefined} />
              ))}
            </div>
            {/* 凡例：実際に出るバッジと同じ名前・色（#42・#61） */}
            <div className="legend">
              <span><i className="sw" style={{ border: '1px dashed #8C959F' }} /><Badge tone="info">予定</Badge>まだ確定していないお届け（数量はご注文・変更の締切の後）</span>
              <span><i className="sw" style={{ border: '1px solid #8C959F' }} />確定したお届け</span>
              <span><Badge tone="warning">一部お届け</Badge>一部お届け済</span>
              <span><Badge tone="warning">ご提案あり</Badge>別の日のご提案（ご返事が必要）</span>
              <span><Badge tone="warning">再配送準備</Badge>再配送準備中</span>
              <span><Badge tone="negative" fixed>お届け中止</Badge>お届けを中止</span>
              <span><Badge tone="warning">確認中</Badge>配送状況を確認中です</span>
              <span><Badge tone="info">日付変更</Badge>ESキッチンがお届け日を変更</span>
              <span><i className="sw" style={{ background: '#EDF0F3' }} />先月・来月</span>
              <span>日付を押すと、お届けの詳細を開きます</span>
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.142857rem', minWidth: 0 }}>
            <Card>
              <SectionTitle action={<a href="/corp/news" className="es-link" onClick={(e) => { e.preventDefault(); router.push('/corp/news'); }}>お知らせ一覧へ</a>}>お知らせ</SectionTitle>
              <NoticeList items={data.news} onNoLink={() => toast(NO_DETAIL)} empty="お知らせはありません。" />
            </Card>
            {/* ご確認ください（版1.1）：先頭の行＝締切の警告（W200）、その下に #58 の4種類。どちらもないときだけ I202 */}
            <Card>
              <SectionTitle action={<a href="/corp/requests" className="es-link" onClick={(e) => { e.preventDefault(); router.push('/corp/requests'); }}>お届け日の変更申請の一覧へ</a>}>ご確認ください</SectionTitle>
              {!ro && data.orderDue && (
                <InlineMessage tone="warning" title={`${data.orderDue.label}のご注文がまだ入力されていません（締切 ${fmtDate(data.orderDue.to)}・${data.orderDue.daysLeft ? 'あと' + data.orderDue.daysLeft + '日' : '本日まで'}）。`}>
                  {(isBranch ? '' : data.orderDue.branches.map((b) => b.name).join('・') + '：')}締切までにご注文がない場合は、自動注文（「次回以降も適用」の AI（自動提案）があればその数）でお届けします。{' '}
                  <a href="/corp/order" className="es-link" onClick={(e) => { e.preventDefault(); router.push('/corp/order'); }}>商品注文を開く</a>
                </InlineMessage>
              )}
              {data.todo.length > 0
                ? <NoticeList items={data.todo} onNoLink={() => toast(NO_DETAIL)} />
                : !data.orderDue && <EmptyState title="確認が必要なお届けはありません。" icon="BellSimple" compact />}
              {!ro && <div className="note">お届け日の変更を申請できるのは、翌月以降の「予定」のお届け（ご注文・変更の締切まで）です。今月・過去・確定したお届けはESキッチンへお問い合わせください。</div>}
            </Card>
          </div>
        </div>
      )}
    </Page>
  );
}
