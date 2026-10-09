'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import carrier from '@/lib/carrier/area';
import { addDaysIso, checkStaff, DST, isoOf, type Errors } from '@/lib/carrier/logic';
import { WH } from '@/lib/carrier/seed';
import type { Staff, StaffDraft } from '@/lib/carrier/types';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { today } from '@/lib/supplier/dates';
import { OpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { Icon } from '../../_ui/Icon';
import { useCarrierSignedIn } from '../../_ui/CarrierProvider';
import { Crumb, DstBadge, Loading, NotFound, Tags } from '../../_ui/parts';
import { StaffDeleteModal, StaffForm } from '../_parts';
import { DateInput } from '@/components/DateInput';

type Tab = 'basic' | 'deliv' | 'hist';
const draftOf = (s: Staff): StaffDraft => ({ name: s.name, kana: s.kana, kbn: s.kbn, st: s.st, tel: s.tel, email: s.email, lic: s.lic });

export default function Page() {
  return <Suspense><StaffDetail /></Suspense>;
}

/** 配送スタッフ詳細（元の staffDetail()・OW_SCHED_001）：基本情報（編集）・担当配送情報・変更履歴 */
function StaffDetail() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const { company, toast, toastError } = useCarrierSignedIn();
  const api = areaApi(carrier);
  const { data } = useQuery(api, 'staffDetail', { company, id });
  const [tab, setTab] = useState<Tab>((sp.get('tab') as Tab) || 'basic');
  const [draft, setDraft] = useState<StaffDraft | null>(null);
  const [errs, setErrs] = useState<Errors>({});
  const [del, setDel] = useState(false);
  const [busy, setBusy] = useState(false);
  const wantEdit = sp.get('edit') === '1';

  // 一覧の鉛筆から来たときは、最初から編集にする
  const loaded = data?.s;
  useEffect(() => {
    if (!wantEdit || !loaded || loaded.del) return;
    setDraft(draftOf(loaded));
    setTab('basic');
    router.replace(`/carrier/staff/${id}`, { scroll: false });
  }, [wantEdit, loaded, id, router]);

  const crumb = <Crumb items={[['ホーム', '/carrier'], ['配送スタッフ', '/carrier/staff'], '配送スタッフ詳細']} />;
  if (data === undefined) return <>{crumb}<Loading /></>;
  if (!data) return <>{crumb}<NotFound text={`配送スタッフ ${id} は見つかりません。`} back="配送スタッフ一覧に戻る" href="/carrier/staff" /></>;
  const s = data.s;
  const e = !!draft;
  const dirty = !!draft && JSON.stringify(draft) !== JSON.stringify(draftOf(s));
  const org = `${data.company}（${company}）・委託`;

  const save = async () => {
    if (!draft) return;
    const x = checkStaff(draft, !!draft.lic);
    setErrs(x);
    if (Object.keys(x).length) return;
    setBusy(true);
    try {
      await api.action('saveStaff', { company, id: s.id, draft });
      setDraft(null);
      toast('配送スタッフ情報を保存しました');
    } catch (err) {
      toastError(err);
    } finally {
      setBusy(false);
    }
  };

  let body = null;
  if (tab === 'basic') body = <StaffForm s={draft ?? draftOf(s)} id={s.id} last={s.last} edit={e} errs={errs} org={org} onChange={(p) => draft && setDraft({ ...draft, ...p })} />;
  if (tab === 'deliv') {
    const ds = data.deliveries, t = isoOf(today());
    const tc = ds.reduce((a, d) => a + d.cash, 0), tp = ds.reduce((a, d) => a + d.park, 0);
    body = (
      <>
        <form className="search-row" onSubmit={(ev) => ev.preventDefault()}>
          <DateInput className="inp" defaultValue={addDaysIso(t, -20)} style={{ width: '12.142857rem', flex: 'none' }} aria-label="開始日" /><span>〜</span>
          <DateInput className="inp" defaultValue={addDaysIso(t, 10)} style={{ width: '12.142857rem', flex: 'none' }} aria-label="終了日" />
          <select className="inp" style={{ maxWidth: '14.285714rem' }} aria-label="状態"><option>状態</option>{Object.keys(DST).map((k) => <option key={k}>{k}</option>)}</select>
          <span style={{ flex: 1 }} /><button type="button" className="btn out">クリア</button><button className="btn pri">検索</button>
        </form>
        <div className="stat"><div><small>集金合計金額</small><b className="num">{tc.toLocaleString('ja-JP')}円</b></div><div><small>駐車合計料金</small><b className="num">{tp.toLocaleString('ja-JP')}円</b></div></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>No</th><th>納品日</th><th>温度帯</th><th>配送No</th><th>引取先</th><th>届け先拠点名</th><th>届け先住所</th><th>配送状況</th><th>配送区分</th><th className="r">集金合計金額（税込）</th><th className="r">駐車合計料金（税込）</th></tr></thead>
            <tbody>
              {ds.map((d, i) => (
                <tr key={d.no}>
                  <td className="num">{i + 1}</td><td className="num">{d.date}</td><td><Tags t={{ [d.temp]: 1 }} full /></td>
                  <td><button type="button" className="lnk" onClick={() => router.push(`/carrier/deliveries/${d.no}`)}>{d.no}</button></td>
                  <td>{WH[d.from]}</td><td>{d.to}</td><td>{d.addr}</td><td><DstBadge d={d} /></td><td>{d.kbn}</td>
                  <td className="num r">{d.cash.toLocaleString('ja-JP')}</td><td className="num r">{d.park.toLocaleString('ja-JP')}</td>
                </tr>
              ))}
              {!ds.length && <tr><td colSpan={11} className="empty">この期間に担当している配送はありません。</td></tr>}
            </tbody>
          </table>
        </div>
      </>
    );
  }
  if (tab === 'hist') body = (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr><th>変更日時</th><th>変更内容</th><th>変更者</th></tr></thead>
        <tbody>{data.hist.map((r, i) => <tr key={i}><td className="num">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td></tr>)}</tbody>
      </table>
    </div>
  );

  return (
    <>
      <OpsLeaveGuard dirty={dirty} />
      {crumb}
      <div className="phead">
        <h1 className="ptitle">配送スタッフ詳細 {s.id} {s.del && <span className="badge b-gray">削除済</span>}</h1>
        <div style={{ display: 'flex', gap: '0.857143rem', flexWrap: 'wrap' }}>
          {e ? (
            <><button type="button" className="btn" onClick={() => { setDraft(null); setErrs({}); }}>キャンセル</button><button type="button" className="btn pri" disabled={busy} onClick={save}>保存</button></>
          ) : !s.del && (
            <>
              <button type="button" className="btn" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => setDel(true)}><Icon name="trash" />削除</button>
              <button type="button" className="btn out" onClick={async () => {
                /* 再設定の代行：4桁の認証コードを登録メールへ（メールは仮。開発中はコードを出す：2026/10/03） */
                try { const r = await api.action('resetStaffPassword', { company, id: s.id }); toast(`パスワード再設定の認証コードを ${r.sentTo} に送りました（開発中：メールは仮。コード ${r.devCode}・${r.minutes}分有効）`); } catch (err) { toastError(err); }
              }}>パスワード再設定</button>
              <button type="button" className="btn pri" onClick={() => { setDraft(draftOf(s)); setTab('basic'); setErrs({}); }}><Icon name="pen" />編集</button>
            </>
          )}
        </div>
      </div>
      <div className="panel">
        <div className="tabs" role="tablist">
          {([['basic', '基本情報'], ['deliv', '担当配送情報'], ['hist', '変更履歴']] as [Tab, string][]).map(([k, l]) => (
            <button type="button" key={k} className={tab === k ? 'on' : ''} disabled={e && k !== 'basic'} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        {body}
      </div>
      {del && (
        <StaffDeleteModal
          name={s.name} id={s.id} block={data.block} onClose={() => setDel(false)}
          onOk={async () => {
            try {
              const r = await api.action('deleteStaff', { company, id: s.id });
              setDel(false);
              router.push('/carrier/staff');
              toast(`${r.name} を削除しました`);
            } catch (err) {
              setDel(false);
              toastError(err);
            }
          }}
        />
      )}
    </>
  );
}
