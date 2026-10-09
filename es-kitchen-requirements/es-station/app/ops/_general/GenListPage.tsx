'use client';

import { usePathname } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import type { GenKey, GenRow } from '@/lib/ops/general/types';
import { Icon } from '../_ui/Icon';
import { useOps } from '../_ui/OpsProvider';
import { Badge, ConfirmModal, Modal, PageHead } from '../_ui/ui';
import { listCsvFilters, OpsCsvExport, OpsCsvImport } from '../_ui/csv';
import { GEN, type GenBtn, type GenCol } from './gen';
import { GEN_FEATURES, type PermOp } from '@/lib/ops/permissions';
import { ActCell, dropList, hideRulesOf, ListView, searchKeysOf, useList, type ListCol, type ListFilter } from './list';
import { api, DEL_MSG, demoMsg, DemoNote, useAskDelete } from './parts';

/* 一覧だけの画面（元の renderGen・genCell）。商品マスタ・資材マスタ・配送関連・仕入先・アカウント・権限・お知らせ・設定の一覧 */

/** アカウント一覧のタブ（元の S.tab。画面を移っても残る） */
const TAB = new Map<GenKey, number>();

/**
 * CSV（00_確認してほしい/CSV入出力_定義_20261003.md）：取込のある一覧は取込と同じ列（lib/csv のエンティティ）、
 * ほかは画面の列＋共通データの文書の全部の項目（source）
 */
export const GEN_CSV: Partial<Record<GenKey, { entity?: string; key?: (r: GenRow) => string; source?: (tab: number) => string }>> = {
  product: { entity: 'products' }, consign: { entity: 'carriers' }, warehouse: { entity: 'warehouses' },
  driver: { entity: 'drivers' }, supplier: { entity: 'suppliers', key: (r) => String(r.id) },
  cooler: { source: () => 'dm.carrier.coolers' }, perm: { source: () => 'dm.account.roles' }, version: { source: () => 'dm.account.appVersions' },
  ip: { source: () => 'dm.account.ipRules' }, notices: { source: () => 'dm.notice.announcements' },
  accounts: { source: (tab) => (tab === 2 ? 'dm.app.users' : 'dm.account.accounts') },
};

/** 元の genCell：列の種類ごとの <td> */
/** 一覧の行の追加の操作（倉庫マスタ・委託配送先の「一括変更」など） */
export type RowAct = { label: string | ((r: GenRow) => string); show?: (r: GenRow) => boolean; onClick: (r: GenRow) => void };

function genTd(key: GenKey, c: GenCol, r: GenRow, h: { canEdit: boolean; canDel: boolean; onLink: (r: GenRow) => void; onEdit: (r: GenRow) => void; onDel: (r: GenRow) => void; rowAct?: RowAct }): ReactNode {
  const [k, , t = ''] = c;
  if (k === '_act') {
    if (['削除済', '終了'].includes(String(r.status))) return <td className="act" />;
    const ex = h.rowAct && (!h.rowAct.show || h.rowAct.show(r)) ? <button className="btn out sm" style={{ marginRight: '0.428571rem', whiteSpace: 'nowrap' }} onClick={() => h.rowAct!.onClick(r)}>{typeof h.rowAct.label === 'function' ? h.rowAct.label(r) : h.rowAct.label}</button> : undefined;
    return <ActCell extra={ex} onEdit={t.includes('e') && h.canEdit ? () => h.onEdit(r) : undefined} onDel={t.includes('d') && h.canDel ? () => h.onDel(r) : undefined} />;
  }
  if (k === '_img') return <td><div className="thumb"><Icon name="img" /></div></td>;
  /* 免許証の写真のサムネイル（配送スタッフ。ないときは画像なしのアイコン） */
  if (k === '_lic') return <td><div className="thumb" style={{ width: '3.714286rem' }} title={r.lic ? '免許証あり' : '免許証なし'}>{r.licImg ? <img src={String(r.licImg)} alt="免許証" /> : <Icon name={r.lic ? 'card' : 'img'} />}</div></td>;
  if (k === '_os') return <td><span className="os"><i>{r.os === 'IOS' ? '' : 'A'}</i>{String(r.os)}</span></td>;
  const v = r[k] as string | undefined;
  /* あり／なし・ON／OFF の列は、表では「✓」か空（2026/10/03 決定。絞り込みの値は元のまま） */
  if (k === 'smpOn' || k === 'thomas') return <td>{v === 'あり' ? '✓' : ''}</td>;
  if (k === 'force') return <td>{v === 'ON' ? '✓' : ''}</td>;
  if (k === 'biz') return <td>{v === 'はい' ? '✓' : ''}</td>;
  if (k === 'pick') return <td>{String(v || '').split('・').filter(Boolean).map((n) => <span key={n} className="badge b-mute" style={{ marginRight: '0.285714rem' }}>{n}</span>)}</td>;
  if (k === 'status') return <td><Badge v={v ?? ''} /></td>;
  if (t.includes('link') && r.noLink) return <td>{v}</td>;   /* アプリの利用者（アカウント一覧のユーザー）は名前をリンクにしない */
  if (t.includes('link')) return <td><button className={`lnk${t.includes('u') ? ' u' : ''}${k === 'id' ? ' mono' : ''}`} onClick={() => h.onLink(r)}>{v}</button></td>;
  if (t.includes('chip')) return <td><span className="badge b-mute">{v}</span></td>;
  return <td className={`${t.includes('num') ? 'num' : ''}${k === 'id' ? ' mono' : ''}`}><div className={t.includes('clip') ? 'clip' : ''} title={String(v ?? '')}>{v}</div></td>;
}

export function GenListPage({ genKey, onNew, onLink, onEdit, onDel, onImport, filters, before, rowAct, cols: colsOverride, mapRows }: {
  genKey: GenKey;
  /** 列（なければ gen.ts のまま。画面だけで列を足すとき） */
  cols?: GenCol[];
  /** 行に画面で値を足す（共通データの項目を画面で読んで足すとき） */
  mapRows?: (rows: GenRow[]) => GenRow[];
  /** 行の追加の操作（操作の列に出す） */
  rowAct?: RowAct;
  /** CSV取込（なければ CSV取込の画面 …/import へ。取込のない一覧は「準備中」のトースト） */
  onImport?: () => void;
  /** 検索条件（選択肢を共通データから作るとき。なければ gen.ts のまま） */
  filters?: ListFilter[];
  /** 新規登録（なければ「準備中」のトースト） */
  onNew?: () => void;
  /** ID・名前のリンク（なければ「準備中」のトースト） */
  onLink?: (r: GenRow) => void;
  /** 鉛筆（なければ「準備中」のトースト） */
  onEdit?: (r: GenRow) => void;
  /** 削除（確認から先。なければ共通の削除：確認 → deleteRow → トースト。権限の「使用中で削除できない」モーダルなど、画面で出し分けるとき） */
  onDel?: (r: GenRow) => void;
  /** 見出しとカードの間に出すもの（仕入先の申込の帯など） */
  before?: ReactNode;
}) {
  const g = GEN[genKey];
  const pathname = usePathname();
  const { toast, toastError, can, openModal, closeModal } = useOps();
  /* 権限（機能の操作）がないボタンは出さない（API はサーバーでも確かめる） */
  const feature = GEN_FEATURES[genKey];
  const may = (op: PermOp) => can(feature, op);
  const askDelete = useAskDelete();
  const [tab, setTab] = useState(() => TAB.get(genKey) ?? 0);
  const list = useList(g.tabs ? `${genKey}:${tab}` : genKey);
  const { data } = useQuery(api, 'genList', { key: genKey, tab });
  const rawRows = useMemo(() => (data ?? []) as GenRow[], [data]);
  const rows = useMemo(() => (mapRows ? mapRows(rawRows) : rawRows), [mapRows, rawRows]);
  const gcols = colsOverride ?? g.cols;

  const h = {
    canEdit: may('update'),
    canDel: may('delete'),
    onLink: onLink ?? (() => toast(demoMsg('詳細画面はこのデモでは「代理・紹介管理」と商品マスタのみ操作できます', '詳細画面は準備中です'))),
    onEdit: onEdit ?? (() => toast(demoMsg('編集画面はこのデモでは「代理・紹介管理」と商品マスタのみ操作できます', '編集画面は準備中です'))),
    onDel: onDel ?? ((r: GenRow) => askDelete(async () => {
      try { await api.action('deleteRow', { key: genKey, uid: r._uid }); toast(DEL_MSG); } catch (e) { toastError(e); }
    })),
    rowAct,
  };
  /* opts が空の選ぶ条件は一覧の行の値（・でつないだ値は1つずつ）から作る。選択肢を画面に固定で持たない */
  const fl = useMemo(() => (filters ?? g.filters)?.map((f) => {
    if (f.t !== 'select' || f.opts.length || !f.col) return f;
    const col = f.col;
    return { ...f, opts: [...new Set(rows.flatMap((r) => String(r[col] ?? '').split('・').map((x) => x.trim())).filter((x) => x && x !== '—'))].sort((a, b) => a.localeCompare(b, 'ja')) };
  }) ?? null, [filters, g.filters, rows]);
  /*
   * アカウント一括発行（委託配送先・仕入先。受付簿 #62）：行を選んで「アカウント一括発行」→ 確認 → general.issueAccounts。
   * 結果（発行した・飛ばした（発行済み・メールなし など））をモーダルで出す。ログイン案内は共通データの通知（account_issued）
   */
  const issuable = genKey === 'consign' || genKey === 'supplier';
  const [sel, setSel] = useState<Set<string>>(() => new Set());
  const canIssue = (r: GenRow) => !['削除済', '無効', '申込中', '却下'].includes(String(r.status));
  const toggleSel = (id: string, on: boolean) => setSel((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
  /*
   * Q170（確認：「キャンセル」「発行する」）→ S172（発行した件数のトースト）→ 発行できなかった行があれば E240 のモーダル（行・理由。「閉じる」）。
   * 理由：無効／発行済み／メールアドレスがない／申込中（承認で発行）／却下（台帳 F 2026-10-06・受付簿 No.175）
   */
  const issue = () => {
    const ids = [...sel];
    openModal(<ConfirmModal kind="warn" title="アカウント一括発行" okCls="pri"
      text={<>選んだ{ids.length}件のアカウントを発行し、担当者にログイン案内メールを送ります。<br />よろしいですか？</>} ok="発行する" cancel="キャンセル"
      onOk={async () => {
        try {
          const out = await api.action('issueAccounts', { key: genKey as 'consign' | 'supplier', ids });
          setSel(new Set());
          if (out.issued.length) toast(`${out.issued.length}件のアカウントを発行しました。`);
          if (out.skipped.length) {
            openModal(
              <Modal title={`${out.skipped.length}件は発行できませんでした。`} width={640} footer={<><span style={{ flex: 1 }} /><button className="btn lg" onClick={closeModal} autoFocus>閉じる</button></>}>
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead><tr><th>行（ID・名前）</th><th>理由</th></tr></thead>
                    <tbody>
                      {out.skipped.map((x) => <tr key={x.id}><td><span className="mono">{x.id}</span>{x.name ? `・${x.name}` : ''}</td><td>{x.reason}</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </Modal>,
            );
          }
        } catch (e) { toastError(e); }
      }} />);
  };
  const selCol: ListCol<GenRow>[] = issuable && may('create') ? [{
    key: '_sel', label: '選択',
    td: (r) => <td>{canIssue(r) ? <input type="checkbox" checked={sel.has(r._uid)} aria-label={`${String(r.name)} を選択`} onChange={(e) => toggleSel(r._uid, e.target.checked)} /> : null}</td>,
  }] : [];
  const cols: ListCol<GenRow>[] = [...selCol, ...gcols.map((c): ListCol<GenRow> => ({ key: c[0], label: c[1], num: !!c[2]?.includes('num'), act: c[0] === '_act', td: (r) => genTd(genKey, c, r, h) }))];

  const notYet = () => toast(demoMsg('登録画面はこのデモでは「代理・紹介管理」のみ操作できます', '登録画面は準備中です'));
  const title = g.tabs ? `アカウント管理（${g.tabs[tab]}）` : g.title;
  const cv = GEN_CSV[genKey] ?? {};
  const csvCols = gcols.filter((c) => c[0][0] !== '_').map((c) => ({ label: c[1], get: (r: GenRow) => r[c[0]] }));
  const BTN: Record<GenBtn, ReactNode> = {
    csv: <OpsCsvExport<GenRow> key="csv" screen={title} filters={listCsvFilters(list, fl)} rows={() => list.apply(rows, 'status', searchKeysOf(fl), hideRulesOf(fl))}
      {...(cv.entity ? { entity: cv.entity, keys: cv.key ?? ((r: GenRow) => r._uid) } : { columns: csvCols, ...(cv.source ? { source: { kind: cv.source(tab), id: (r: GenRow) => r._uid } } : {}) })} />,
    /* CSV取込はモーダルではなく画面（…/import。hong 2026/10/05）。取込の画面は app/ops/_general/GenCsvImportPage.tsx */
    import: cv.entity && !onImport
      ? <OpsCsvImport key="import" href={`${pathname}/import`} />
      : <button key="import" className="btn csv lg" onClick={onImport ?? (() => toast(demoMsg('CSV取込はこのデモでは操作できません', 'CSV取込は準備中です')))}><Icon name="upl" />CSV取込</button>,
    new: <button key="new" className="btn pri lg" onClick={onNew ?? notYet}><Icon name="plus" />新規登録</button>,
    acct: <button key="acct" className="btn out lg" disabled={!sel.size} onClick={issue}><Icon name="group" />アカウント一括発行{sel.size ? `（${sel.size}件）` : ''}</button>,
    perm: <button key="perm" className="btn pri lg" onClick={onNew ?? notYet}><Icon name="plus" />権限登録</button>,
    user: <button key="user" className="btn pri lg" onClick={onNew ?? notYet}><Icon name="userplus" />新規登録</button>,
  };
  /* CSV出力はすべての一覧に、CSV取込は取込のできる一覧に出す（決定 2026/10/03） */
  let btns: GenBtn[] = [...g.btns];
  if (cv.entity && !btns.includes('import')) btns.unshift('import');
  if (!btns.includes('csv')) btns.splice(btns.includes('import') ? btns.indexOf('import') + 1 : 0, 0, 'csv');
  const NEED: Record<GenBtn, PermOp> = { csv: 'csvExport', import: 'csvImport', new: 'create', acct: 'create', perm: 'create', user: 'create' };
  btns = btns.filter((b) => may(NEED[b]));

  return (
    <>
      <DemoNote />
      <PageHead crumbs={g.crumbs} title={title}>{btns.map((b) => BTN[b])}</PageHead>
      {before}
      <div className="card">
        {g.tabs && (
          <div className="tabs">
            {g.tabs.map((n, i) => <button key={n} className={i === tab ? 'on' : ''} onClick={() => { TAB.set(genKey, i); dropList(`${genKey}:${i}`); setTab(i); }}>{n}</button>)}
          </div>
        )}
        <ListView key={list.key} list={list} filters={fl} cols={cols} rows={rows} rowKey={(r) => r._uid} />
      </div>
    </>
  );
}
