'use client';

import { daysLeft, isoOf, OPEN_ST, QSTATUS } from '@/lib/carrier/logic';
import type { Quote, QuoteKind, QuoteStatus } from '@/lib/carrier/types';
import { today } from '@/lib/supplier/dates';
import { Icon } from '../_ui/Icon';
import { Fld } from '../_ui/parts';
import { fmtDate } from '@/lib/format/date';
import { carrierCls } from '@/lib/format/status';

/* 見積依頼の画面の部品（元の kindTag・stBadge・dueCell・lockNote・reqFields） */

export const KindTag = ({ k }: { k: QuoteKind }) =>
  k === '金額再確認' ? <span className="qtag re"><Icon name="warn" />金額再確認</span> : <span className="qtag new">新規見積</span>;

/** 回答状況（色は全サイト共通の表 lib/format/status.ts） */
export const StBadge = ({ s }: { s: QuoteStatus }) => <span className={`badge ${carrierCls(s, QSTATUS[s] ?? 'b-gray')}`}>{s}</span>;

/** 回答期限の札（期限超過・本日期限・残りN日） */
export function DueBadge({ due, open = true }: { due: string; open?: boolean }) {
  if (!open) return null;
  const d = daysLeft(due, isoOf(today()));
  if (d < 0) return <span className="badge b-red">期限超過</span>;
  if (d === 0) return <span className="badge b-red">本日期限</span>;
  if (d <= 3) return <span className="badge b-amber">残り{d}日</span>;
  return null;
}
export function DueCell({ q }: { q: Quote }) {
  const open = OPEN_ST.includes(q.st);
  const d = daysLeft(q.due, isoOf(today()));
  return <span className={`due ${open && d <= 0 ? 'red' : open && d <= 3 ? 'warn' : ''}`}><span className="num">{fmtDate(q.due)}</span><DueBadge due={q.due} open={open} /></span>;
}

export const LockNote = () => <p className="lock"><Icon name="lock" />運営が設定した条件のため、編集できません。</p>;

/** 運営が設定した依頼内容（withHead＝案件ID・対象法人・件名も出す） */
export function ReqFields({ q, withHead }: { q: Quote; withHead?: boolean }) {
  const r = q.req;
  return (
    <div className="grid2">
      {withHead && <><Fld label="案件ID" value={q.id} /><Fld label="対象法人" value={q.corp} /><Fld label="件名" cls="span3"><textarea className="inp" readOnly rows={2} style={{ minHeight: '3.714286rem' }} value={q.t} /></Fld></>}
      <Fld label="集荷先" value={r.pick} /><Fld label="配送エリア" value={r.area} /><Fld label="住所" value={r.addr} /><Fld label="取扱商品（冷蔵／冷凍）" value={r.goods} /><Fld label="自販機" value={r.vend} /><Fld label="土日対応" value={r.weekend} />
      <Fld label={withHead ? 'プラン（月次個数）' : 'プラン'} value={r.plan} /><Fld label="コース" value={r.course} /><Fld label="配送方法" value={r.ship} />
      <Fld label="納品スケジュールのサイクル（希望の曜日）" value={r.cycle} /><Fld label="希望開始日" value={r.start} /><Fld label="回答期限" value={r.dueJ} /><Fld label="金額条件" value={r.priceCond} />
      <Fld label="まとめて見積する拠点" cls="span3"><textarea className="inp" readOnly rows={2} value={r.moreSites} /></Fld>
      <Fld label="詳細・特記事項" cls="span3"><textarea className="inp" readOnly value={r.note} /></Fld>
    </div>
  );
}
