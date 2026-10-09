'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CsvImportModal } from '@/components/csv/CsvImportModal';
import { PREF_GROUPS } from '@/lib/domain/prefs';
import { useQuery } from '@/lib/ops/core/client';
import { fmtDateTime, fmtDatesIn } from '@/lib/format/date';
import { yen } from '@/lib/format/money';
import { MSG, type FRow, type MKey, type TCol, type TDef } from '@/lib/ops/general/masterForms';
import { api } from '../parts';
import { ListTable, ListView, useList, type ListCol, type ListFilter } from '../list';
import { Icon } from '../../_ui/Icon';
import { useOps } from '../../_ui/OpsProvider';
import { OPS_CSV_UI, OPS_ID, OpsCsvExport } from '../../_ui/csv';
import { useScreenCan } from '../../_ui/perm';
import { ConfirmModal } from '../../_ui/ui';

/*
 * 運営Web マスタ（仕入先・委託配送先・倉庫・配送スタッフ）の詳細・登録・編集の部品。
 *   PrefPicker（対応エリア：地方ごとの都道府県）・ChipPicker（複数選ぶチップ）・LicenseInput（免許証の写真）・RowsEdit／RowsView（住所・担当者の表）・
 *   HistTab（変更履歴：P-HIST）・EsFeesTab（委託配送先の ES配送費：CSV取込・CSV出力だけで直す）・usePasswordSend（Q173 → S173）
 */

/** チップ（表示だけ） */
export const ChipList = ({ xs }: { xs: string[] }) => (xs.length
  ? <span className="mr-chips">{xs.map((x) => <span key={x} className="mr-chip">{x}</span>)}</span>
  : <span>—</span>);

/** 複数選ぶチップ（作れる商品・保有車両）。押すと選ぶ・外す */
export function ChipPicker({ id, opts, value, onChange, bad }: { id: string; opts: readonly string[]; value: string[]; onChange: (v: string[]) => void; bad?: boolean }) {
  return (
    <div id={id} className={`mr-chips pick${bad ? ' err' : ''}`} role="group">
      {opts.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" className={`mr-chip${on ? ' on' : ''}`} aria-pressed={on}
            onClick={() => onChange(on ? value.filter((x) => x !== o) : opts.filter((x) => x === o || value.includes(x)))}>
            {on ? '✓ ' : ''}{o}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 対応エリア（都道府県）。選んだ都道府県はチップ（× で外す・多いときは「+n件」）。
 * 「選ぶ」で地方ごとの一覧（地方のチェック＝その地方の全部）・すべて選択・選択クリア（配送会社の申込フォームと同じ：hong 2026-10-06）
 */
export function PrefPicker({ id, value, onChange, bad }: { id: string; value: string[]; onChange: (v: string[]) => void; bad?: boolean }) {
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', off);
    return () => document.removeEventListener('mousedown', off);
  }, [open]);
  const all = PREF_GROUPS.flatMap((g) => g.prefs);
  const set = (xs: string[]) => onChange(all.filter((p) => xs.includes(p)));
  const MAX = 8;
  const shown = more ? value : value.slice(0, MAX);
  return (
    <div className="mr-pref" ref={ref}>
      <div id={id} className={`mr-pref-box${bad ? ' err' : ''}`} role="button" tabIndex={0} aria-expanded={open}
        onClick={() => setOpen((o) => !o)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); } }}>
        {value.length === 0 && <span className="ph">都道府県を選択してください</span>}
        {shown.map((p) => (
          <span key={p} className="mr-chip on">
            {p}
            <button type="button" aria-label={`${p} を外す`} onClick={(e) => { e.stopPropagation(); set(value.filter((x) => x !== p)); }}><Icon name="x" /></button>
          </span>
        ))}
        {!more && value.length > MAX && <button type="button" className="mr-more" onClick={(e) => { e.stopPropagation(); setMore(true); }}>+{value.length - MAX}件</button>}
        <span className="mr-caret"><Icon name="down" /></span>
      </div>
      {open && (
        <div className="mr-pref-pop" role="dialog" aria-label="対応エリアを選ぶ">
          <div className="mr-pref-act">
            <button type="button" className="btn sm" onClick={() => set(all)}>すべて選択</button>
            <button type="button" className="btn sm" onClick={() => set([])}>選択クリア</button>
            <span style={{ flex: 1 }} />
            <span className="hint">{value.length}件を選択中</span>
          </div>
          {PREF_GROUPS.map((g) => {
            const n = g.prefs.filter((p) => value.includes(p)).length;
            return (
              <div key={g.name} className="mr-pref-grp">
                <label className="g">
                  <input type="checkbox" checked={n === g.prefs.length} ref={(el) => { if (el) el.indeterminate = n > 0 && n < g.prefs.length; }}
                    onChange={(e) => set(e.target.checked ? [...value, ...g.prefs] : value.filter((x) => !g.prefs.includes(x)))} />
                  {g.name}
                </label>
                <div className="ps">
                  {g.prefs.map((p) => (
                    <label key={p}><input type="checkbox" checked={value.includes(p)} onChange={(e) => set(e.target.checked ? [...value, p] : value.filter((x) => x !== p))} />{p}</label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** 免許証の写真（点線の枠に置く・選ぶ。JPEG・PNG、5MB まで。data URL で持つ） */
export function LicenseInput({ id, value, onChange, bad }: { id: string; value: string; onChange: (v: string) => void; bad?: boolean }) {
  const { toast } = useOps();
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const read = (f?: File) => {
    if (!f) return;
    if (!/^image\/(png|jpe?g)$/.test(f.type)) { toast('免許証の写真は JPEG か PNG を選んでください。'); return; }
    if (f.size > 5 * 1024 * 1024) { toast('免許証の写真は5MBまでです。'); return; }
    const fr = new FileReader();
    fr.onload = () => onChange(String(fr.result ?? ''));
    fr.readAsDataURL(f);
  };
  return (
    <div id={id} className={`mr-drop${drag ? ' on' : ''}${bad ? ' err' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); read(e.dataTransfer.files?.[0]); }}>
      {value
        ? <img src={value} alt="免許証の写真" className="mr-lic" />
        : <div className="mr-drop-ph"><Icon name="upl" /><span>ここに免許証の写真を置くか、「写真を選ぶ」を押してください</span></div>}
      <div className="mr-drop-btns">
        <button type="button" className="btn sm" onClick={() => ref.current?.click()}>{value ? '写真を変える' : '写真を選ぶ'}</button>
        {value && <button type="button" className="btn sm ghost" onClick={() => onChange('')}>削除</button>}
      </div>
      <input ref={ref} type="file" accept="image/png,image/jpeg" hidden onChange={(e) => { read(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}

/** 表の値の見せ方 */
const cellOf = (c: TCol, v: string) => v || '—';

/** 住所・担当者の表（表示だけ） */
export function RowsView({ t, rows }: { t: TDef; rows: FRow[] }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr><th>区分</th>{t.cols.map((c) => <th key={c.k}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((r, i) => (
            <tr key={i}><td><span className={`badge ${i === 0 ? 'b-info' : 'b-mute'}`}>{i === 0 ? t.main : t.sub}</span></td>{t.cols.map((c) => <td key={c.k} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{cellOf(c, r[c.k] ?? '')}</td>)}</tr>
          )) : <tr><td colSpan={t.cols.length + 1} className="empty">{MSG.E01(t.cols[0].label).replace('は必須項目です。', 'がありません')}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/** 住所・担当者の表（入力。1行目＝本社／メイン担当者で消せない。「行を追加」「行を削除」） */
export function RowsEdit({ mkey, t, rows, errs, onChange }: { mkey: MKey; t: TDef; rows: FRow[]; errs: Record<string, string>; onChange: (rows: FRow[]) => void }) {
  const set = (i: number, k: string, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <>
      <div className="tbl-wrap">
        <table className="tbl mr-rows">
          <thead><tr><th>区分<span className="req">*</span></th>{t.cols.map((c) => <th key={c.k}>{c.label}{c.req && <span className="req">*</span>}</th>)}<th className="act">操作</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td><span className={`badge ${i === 0 ? 'b-info' : 'b-mute'}`}>{i === 0 ? t.main : t.sub}</span></td>
                {t.cols.map((c) => {
                  const ek = `${t.k}.${i}.${c.k}`, e = errs[ek], fid = `${mkey}-${ek}`;
                  return (
                    <td key={c.k}>
                      {c.opts
                        ? <select id={fid} aria-label={`${c.label}（${i + 1}行目）`} className={`sel${e ? ' err' : ''}`} value={r[c.k] ?? ''} onChange={(ev) => set(i, c.k, ev.target.value)}>
                          <option value="">選択</option>{c.opts.map((o) => <option key={o}>{o}</option>)}
                        </select>
                        : <input id={fid} aria-label={`${c.label}（${i + 1}行目）`} className={`inp${e ? ' err' : ''}`} placeholder={c.ex ? `例）${c.ex}` : undefined}
                          type={c.fmt === 'mail' ? 'email' : 'text'} inputMode={c.fmt === 'tel' || c.fmt === 'zip' ? 'tel' : undefined} value={r[c.k] ?? ''} onChange={(ev) => set(i, c.k, ev.target.value)} />}
                      {e && <span className="emsg">{e}</span>}
                    </td>
                  );
                })}
                <td className="act">
                  {i > 0 ? <button type="button" className="d" aria-label={`${i + 1}行目を削除`} title="行を削除" onClick={() => onChange(rows.filter((_, j) => j !== i))}><Icon name="trash" /></button> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn sm out" style={{ marginTop: '0.571429rem' }}
        onClick={() => onChange([...rows, { kind: t.sub, ...Object.fromEntries(t.cols.map((c) => [c.k, ''])) }])}>
        <Icon name="plus" />{t.addLabel}（{t.sub}）
      </button>
    </>
  );
}

/** 変更履歴（P-HIST：変更日時・変更内容・変更者。新しい順・1ページ 10件。0件は I01） */
export function HistTab({ mkey, id }: { mkey: MKey; id: string }) {
  const { data } = useQuery(api, 'genHistory', { key: mkey, id });
  const list = useList(`hist:${mkey}:${id}`);
  const rows = data ?? [];
  const cols: ListCol<(typeof rows)[number]>[] = [
    { key: 'at', label: '変更日時', td: (r) => <td className="num" style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(r.at)}</td> },
    { key: 'what', label: '変更内容', td: (r) => <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{fmtDatesIn(r.what)}</td> },
    { key: 'by', label: '変更者', td: (r) => <td style={{ whiteSpace: 'nowrap' }}>{r.by}</td> },
  ];
  if (!data) return <p className="hint">読み込み中…</p>;
  if (!rows.length) return <div className="empty" style={{ padding: '1.142857rem', textAlign: 'center' }}>表示するデータがありません。</div>;
  return <ListTable list={list} cols={cols} rows={list.apply(rows)} noNo />;
}

/**
 * 委託配送先の ES配送費（AW_CNSG_003 タブ）。絞り込み（都道府県名・市郡名・区町村名・類似住所の有無）と表（1ページ 10件）。
 * 直すのは CSV取込・CSV出力だけ（画面で1行ずつは直さない：hong 2026-10-06）。取込は変更履歴に「CSV取込」で残る
 */
export function EsFeesTab({ id, name }: { id: string; name: string }) {
  const { data, reload } = useQuery(api, 'esFees', { key: 'consign', id });
  const { openModal, closeModal, toast, account } = useOps();
  const can = useScreenCan();
  const list = useList(`esfee:${id}`);
  const rows = useMemo(() => (data ?? []).map((f) => ({ ...f, _uid: f.id })), [data]);
  const uniq = (k: 'pref' | 'gun' | 'town') => [...new Set(rows.map((r) => r[k]).filter(Boolean))];
  const filters: ListFilter[] = [
    { t: 'select', ph: '都道府県名', col: 'pref', opts: uniq('pref') },
    { t: 'select', ph: '市郡名', col: 'gun', opts: uniq('gun') },
    { t: 'select', ph: '区町村名', col: 'town', opts: uniq('town') },
    { t: 'select', ph: '類似住所の有無', col: 'similar', opts: ['あり', 'なし'] },
  ];
  type R = (typeof rows)[number];
  const cols: ListCol<R>[] = [
    { key: 'pref', label: '都道府県名' }, { key: 'gun', label: '市郡名', td: (r) => <td>{r.gun || '—'}</td> }, { key: 'town', label: '区町村名' },
    { key: 'actual', label: '実績有無' },
    { key: 'feeYen', label: '委託費用', num: true, td: (r) => <td className="num">{yen(r.feeYen)}</td> },
    { key: 'add1Yen', label: '地域加算（配送1回あたり）', num: true, td: (r) => <td className="num">{yen(r.add1Yen)}</td> },
    { key: 'add2Yen', label: '地域加算（配送2回あたり）', num: true, td: (r) => <td className="num">{yen(r.add2Yen)}</td> },
    { key: 'note', label: '備考欄', td: (r) => <td><div className="clip" title={r.note}>{r.note || '—'}</div></td> },
  ];
  const scope = { site: 'ops' as const, target: id };
  const imp = () => openModal(
    <CsvImportModal ui={OPS_CSV_UI} entity="carrierEsFees" title={`ES配送費 CSV取込（${name}）`} scope={scope} by={account?.id ?? OPS_ID} notify={toast}
      desc={<>この委託配送先（{id}）の ES配送費を取り込みます。ES配送費ID が空欄の行は新規、入っている行は更新です。</>}
      onClose={closeModal} onDone={() => { void reload(); }} />,
  );
  return (
    <>
      <div className="mr-tabbar">
        <span className="hint">ES配送費は CSV取込・CSV出力で直します（画面では直せません）。</span>
        <span style={{ flex: 1 }} />
        {can('csvImport') && <button type="button" className="btn csv" onClick={imp}><Icon name="upl" />CSV取込</button>}
        <OpsCsvExport<R> className="btn csv" screen={`ES配送費（${name}）`} entity="carrierEsFees" scope={scope} rows={() => list.apply(rows)} keys={(r) => r.id} />
      </div>
      {!data ? <p className="hint">読み込み中…</p> : <ListView list={list} filters={filters} cols={cols} rows={rows} rowKey={(r) => r.id} />}
    </>
  );
}

/**
 * パスワード送信（仕入先・委託配送先・配送スタッフ）。確認 Q173「{メール} にパスワード設定のご案内を送ります。よろしいですか？」→ S173。
 * アカウントが「未発行」「無効」「削除済」のときは押せない（ok＝false）
 */
export function PasswordButton({ mkey, id, to, ok, className = 'btn out lg' }: { mkey: MKey; id: string; to: string; ok: boolean; className?: string }) {
  const { openModal, toast, toastError } = useOps();
  const run = () => openModal(
    <ConfirmModal kind="warn" title="パスワード送信" text={<>{to} にパスワード設定のご案内を送ります。<br />よろしいですか？</>} ok="送信する" okCls="pri"
      onOk={async () => { try { await api.action('genSendPassword', { key: mkey, id }); toast(MSG.S173); } catch (e) { toastError(e); } }} />,
  );
  return (
    <button type="button" className={className} disabled={!ok} onClick={run}
      title={ok ? `${to} にパスワード設定のご案内を送ります` : 'アカウントが「未発行」「無効」「削除済」のときは送れません'}>
      パスワード送信
    </button>
  );
}

/** 申込の内容などの見出しつきの値の並び */
export function KvGrid({ items }: { items: [string, ReactNode][] }) {
  return <div className="kvgrid">{items.map(([l, v]) => <div key={l} className="kv"><small>{l}</small><b style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{v || '—'}</b></div>)}</div>;
}

