'use client';

import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { today } from '@/lib/supplier/dates';
import { cycles, PLANS, PREFS } from '@/lib/corp/sites/logic';
import { useCorp, useCorpSignedIn } from '../../_ui/CorpProvider';
import { Badge, Button, Card, CardT, ConfirmDiscard, Icon, InlineMessage, PageHead, cx } from '../_components/es';
import { api, Loading, Ro, SitesFrame, useAcct, WhoField } from '../_components/parts';
import { fmtDatesIn } from '@/lib/format/date';
import { corpTerm } from '@/lib/domain/terms';

/*
 * 拠点を追加（法人アカウントだけ・RV-CORP-20261002 C-b）。元は申込フォーム（部品21）の「拠点を追加」（法人情報は登録済み）。
 * 送ると運営Web の契約申請管理（新規契約タブ）に受付中の申込（AP-YYYYMMDD-NNNN）が1件できる。
 */
export default function Page() {
  return <SitesFrame><AddSite /></SitesFrame>;
}

type F = { k: string; label: string; req?: boolean; opts?: string[]; ph?: string; wide?: boolean; hint?: string };
const SECTIONS: { title: string; fields: F[] }[] = [
  { title: '新しい拠点（お届け先）', fields: [
    { k: 'name', label: '拠点名（お届け先名）', req: true, ph: '例）株式会社サンプル 福岡営業所' }, { k: 'kana', label: '拠点名フリガナ', req: true, ph: '例）カブシキガイシャサンプル フクオカエイギョウショ' },
    { k: 'emp', label: '従業員数', req: true, ph: '例）40' },
    { k: 'zip', label: '郵便番号', req: true, ph: '例）812-0011' }, { k: 'pref', label: '都道府県', req: true, opts: PREFS }, { k: 'city', label: '市区町村', req: true },
    { k: 'a1', label: '町名・番地', req: true }, { k: 'a2', label: '建物等' }, { k: 'tel', label: '電話番号', req: true },
  ] },
  { title: 'ご契約の内容', fields: [
    { k: 'plan', label: 'プラン', req: true, opts: PLANS }, { k: 'ship', label: '配送方法', req: true, opts: ['ES配送便', 'COOL便'], hint: 'ES配送便＝ESキッチンの便、クール便＝宅配便でのお届けです。' },
    { k: 'eq', label: '設備のご希望', opts: ['冷蔵庫', '冷蔵庫・冷凍庫', '自動販売機（ESライト（自販機））'] },
    { k: 'cyc', label: '開始したいご利用月', req: true, opts: cycles(today()).filter((c) => c.ok).map((c) => c.v), hint: '締切までのお申し込みは翌月のご利用月から、締切を過ぎると翌々月からの反映です。' },
    { k: 'bill', label: '請求書', req: true, opts: ['法人に請求', 'この拠点に請求'] }, { k: 'ng', label: 'お届けできない曜日', ph: '例）土・日・祝日' },
    { k: 'memo', label: 'ご要望（設置場所・搬入経路など）', wide: true },
  ] },
  { title: '新しい拠点のご担当者', fields: [
    { k: 'sname', label: 'お名前', req: true }, { k: 'skana', label: 'フリガナ' }, { k: 'smail', label: 'メールアドレス', req: true }, { k: 'stel', label: '電話番号' },
  ] },
];

function AddSite() {
  /* サイドメニューで離れるときの確認（lib/ui/leaveGuard）。中身は下の dirty を入れる */
  const leaveRef = useRef<() => boolean>(() => false);
  useOpsLeaveGuard(() => leaveRef.current());
  const router = useRouter();
  const acct = useAcct();
  const { isBranch } = useCorpSignedIn();
  const { toast, toastError } = useCorp();
  const { data } = useQuery(api, 'applyCtx', { acct });
  const [f, setF] = useState<Record<string, string>>({ ship: 'ES配送便', bill: '法人に請求', cyc: cycles(today()).find((c) => c.ok)?.v ?? '' });
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [who, setWho] = useState('');
  const [whoErr, setWhoErr] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  if (isBranch) return <Card><b>拠点の追加は法人アカウントだけができます</b></Card>;
  if (!data) return <Loading />;
  const dirty = Object.keys(f).some((k) => !['ship', 'bill', 'cyc'].includes(k) && f[k]);
  leaveRef.current = () => dirty;
  const cands = data.corpStaff.map((r) => ({ value: r[3] || r[1], name: r[1], where: '法人', kind: r[0], mail: r[3] }));
  async function send() {
    const miss: Record<string, boolean> = {};
    SECTIONS.forEach((s) => s.fields.forEach((x) => { if (x.req && !String(f[x.k] ?? '').trim()) miss[x.k] = true; }));
    setErrs(miss);
    if (Object.keys(miss).length) { toast('未入力の項目があります'); return; }
    if (!who) { setWhoErr(true); return; }
    try { const r = await api.action('addSite', { acct, f, who }); setDone(r.no); window.scrollTo(0, 0); } catch (x) { toastError(x); }
  }
  if (done) return (
    <>
      <PageHead crumbs={[['拠点管理', () => router.push('/corp/sites')], '拠点を追加']} title="拠点を追加" />
      <CardT title={<>お申し込みを受け付けました<span className="sub" style={{ display: 'inline', marginLeft: '0.857143rem' }}>受付番号 {done}</span></>}>
        <div className="es-formgrid"><Ro label="受付番号" v={done} /><Ro label="お手続き" v="拠点を追加" /><Ro label="新しい拠点" v={f.name} />
          <div className="es-field"><label className="es-field__label">状態</label><div className="ro"><Badge tone="info">ESキッチンが確認中</Badge></div></div></div>
        <InlineMessage tone="info" title="ESキッチンが内容を確認し、ご契約の設定をしてからメールでお知らせします。">承認されると、新しい拠点が拠点一覧に出て、拠点アカウントを発行します。</InlineMessage>
        <div style={{ display: 'flex', gap: '0.642857rem', marginTop: '1rem' }}><Button onClick={() => router.push('/corp/sites')}>拠点一覧へ戻る</Button><Button variant="outline" onClick={() => router.push('/corp/requests/contract')}>申請の一覧へ</Button></div>
      </CardT>
    </>
  );
  return (
    <>
      <PageHead crumbs={[['拠点管理', () => (dirty ? setDiscard(true) : router.push('/corp/sites'))], '拠点を追加']} title="拠点を追加"
        stat={<><span>法人 <b>{data.corpName}</b></span><span className="k">法人情報は登録済みのものを使います</span></>}
        actions={<><Button variant="outline" onClick={() => (dirty ? setDiscard(true) : router.push('/corp/sites'))}>キャンセル</Button><Button onClick={send}>この内容でお申し込みする</Button></>} />
      <InlineMessage tone="info" title="新しい拠点のお申し込みです。">ESキッチンが内容を確認し、ご契約を設定してからお届けを始めます。契約に関するお申し込みは、ご注文と同じ締切（前月15日）です。</InlineMessage>
      <div className="cb-stack">
        {SECTIONS.map((s) => (
          <CardT key={s.title} title={s.title}>
            <div className="es-formgrid">
              {s.fields.map((x) => (
                <div key={x.k} className={cx('es-field', x.wide && 'es-span-3', errs[x.k] && 'es-field--error')}>
                  <label className="es-field__label">{x.label}{x.req ? <span className="es-field__req">*</span> : null}</label>
                  {x.opts
                    ? <div className="es-input es-select es-input--md"><select value={f[x.k] ?? ''} onChange={(e) => setF({ ...f, [x.k]: e.target.value })}><option value="" disabled>選択してください</option>{x.opts.map((o) => <option key={o} value={o}>{corpTerm(fmtDatesIn(o))}</option>)}</select><Icon name="CaretDown" size={16} /></div>
                    : <div className="es-input es-input--md"><input value={f[x.k] ?? ''} placeholder={x.ph} onChange={(e) => setF({ ...f, [x.k]: e.target.value })} /></div>}
                  {errs[x.k] ? <span className="es-field__msg es-field__msg--error">{x.label}をご入力ください。</span> : x.hint ? <span className="es-field__msg">{x.hint}</span> : null}
                </div>
              ))}
            </div>
          </CardT>
        ))}
        <CardT title="お申し込みされる方"><WhoField cands={cands} value={who} err={whoErr} word="お申し込み者" onPick={(w) => { setWho(w); setWhoErr(false); }} /></CardT>
      </div>
      {discard ? <ConfirmDiscard onCancel={() => setDiscard(false)} onConfirm={() => router.push('/corp/sites')} /> : null}
    </>
  );
}
