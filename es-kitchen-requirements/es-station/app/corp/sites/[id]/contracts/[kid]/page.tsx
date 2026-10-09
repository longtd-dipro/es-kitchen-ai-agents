'use client';

import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { useParams, useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { ctSt, EARLIEST, EARLIEST_CYC, EARLIEST_DUE, PROCS, TONE_CT, TONE_LOAN, ym, type ProcKey } from '@/lib/corp/sites/logic';
import { useCorp } from '../../../../_ui/CorpProvider';
import { Badge, Button, Card, CardT, ConfirmDiscard, Dialog, InlineMessage, PageHead, Radio, Tabs, cx } from '../../../_components/es';
import { api, ApplyDialog, ChangeList, Lab, Loading, Lnk, Mc, Ro, RoText, SitesFrame, Tbl, Td, useAcct, WhoField } from '../../../_components/parts';

/*
 * 月ごとのご契約（ご契約内容）＝ ENTITY の「契約情報編集」の法人Web表示（元：22_法人_拠点管理.html の Kid）。
 * 2026年11月サイクル以降は「編集」で配送備考（すぐ反映）を直し、保存時に適用範囲を選ぶ。
 * 納品不可曜日・設備の希望日は表示だけで「拠点情報の変更」で申請する（2026/10/05 F3・決定 D8）。
 */
export default function Page() {
  const { id, kid } = useParams<{ id: string; kid: string }>();
  return <SitesFrame><Kid key={kid} id={id} kidId={kid} /></SitesFrame>;
}

/* RV2-CORP-20261002：納品サイクルは拠点ごと（ホーム・月次注文のお届け日と同じ） */
const CYC: Record<string, string> = { CU00643: 'A3・C3', CU00961: 'A3・C3', CU00871: 'A2・C2', CU00950: 'A2・C2', CU00902: 'A3', CU00975: 'C4', CU00671: 'A3・C3' };
const A1: Record<string, string> = {
  '2027-03': '2027/03/01〜03/28', '2027-02': '2027/02/01〜02/28', '2027-01': '2027/01/04〜01/31', '2026-12': '2026/12/07〜2027/01/03',
  '2026-11': '2026/11/09〜12/06', '2026-10': '2026/10/12〜11/08', '2026-09': '2026/09/14〜10/11',
};

type Save = { scope: 'only' | 'after'; who: string; whoErr?: boolean; now: { label: string; from: string; to: string }[] };

function Kid({ id, kidId }: { id: string; kidId: string }) {
  /* サイドメニューで離れるときの確認（lib/ui/leaveGuard）。中身は下の dirty を入れる */
  const leaveRef = useRef<() => boolean>(() => false);
  useOpsLeaveGuard(() => leaveRef.current());
  const router = useRouter();
  const acct = useAcct();
  const { toast, toastError } = useCorp();
  const { data } = useQuery(api, 'site', { acct, id });
  const [ktab, setKtab] = useState('ct');
  const [ked, setKed] = useState<{ memo: string } | null>(null);
  const [modal, setModal] = useState<{ type: 'save'; m: Save } | { type: 'discard'; go: () => void } | { type: 'apply'; proc: ProcKey } | null>(null);
  if (!data) return <Loading />;
  const s = data.site, k = s.kids.find((x) => x.id === kidId);
  if (!k) return <Card><b>月ごとのご契約が見つかりません</b></Card>;
  const cycLabel = ym(k.cyc) + '分', a1 = A1[k.cyc];
  const std = k.plan.includes('スタンダード'), vm = k.plan.includes('自販機');
  const nn = /冷蔵(\d+回)・冷凍(\d+回)/.exec(k.n), cyc = CYC[s.id] || 'A2・C2';
  const cycOf = (n: string) => (parseInt(n, 10) === 2 ? cyc : cyc.split('・')[0]);
  /* 「A3・C3」→「第1・第3水曜日」（A〜D＝4週間の何週目、数字＝曜日 1＝月曜。コードは画面に出さない） */
  const wkOf = (code: string) => {
    const by: Record<string, string[]> = {};
    for (const c of code.split('・')) { const m = /^([A-D])([1-7])$/.exec(c); if (m) (by[m[2]] ??= []).push('第' + (m[1].charCodeAt(0) - 64) + ''); }
    return Object.entries(by).map(([d, w]) => w.join('・') + '週の' + '月火水木金土日'[+d - 1] + '曜日').join('、') || code;
  };
  const routes: string[][] = [['冷蔵配送', nn ? nn[1] : k.n, 'ESキッチンの定期便', wkOf(cycOf(nn ? nn[1] : k.n))]];
  if (std) routes.push(['冷凍配送', nn ? nn[2] : '1回', 'ESキッチンの定期便', wkOf(cycOf(nn ? nn[2] : '1回'))]);
  routes.push(['資材配送', '—', '都度配送（ご注文のたび）', '—']);
  const first = s.kids[s.kids.length - 1].id === k.id;
  const editable = k.cyc >= EARLIEST_CYC && s.status !== '休止中';
  const ko = data.kover[k.id];
  const ki = { ng: s.kidInfo.ng, memo: ko ? ko.memo : s.kidInfo.memo, date: '' };
  const moves = first ? s.loans.filter((r) => r[10] !== '回収済').map((r) => ['設置', r[0], r[1], r[2], r[3], String(r[4]), r[7], r[7], '新規のお申し込み', ''].map(String)) : [];
  const dirty = () => !!ked && ked.memo !== ki.memo;
  leaveRef.current = dirty;
  const leave = (go: () => void) => { if (dirty()) setModal({ type: 'discard', go }); else { setKed(null); go(); } };
  const backDetail = () => leave(() => router.push(`/corp/sites/${s.id}?tab=ct`));
  const reqLink2 = (kk: ProcKey) => (!ked && editable && data.procs.includes(kk) ? <Lnk cls="cb-act" onClick={() => setModal({ type: 'apply', proc: kk })}>{PROCS[kk].label}を申請 ›</Lnk> : null);
  const infoLink = () => {
    const ok = data.procs.includes('info');
    return (
      <span className="es-field__msg">変更は「拠点情報の変更」で申請してください（ESキッチンの承認後に反映）。
        {ok ? <Lnk cls="cb-act" onClick={() => leave(() => router.push(`/corp/requests/contract/new?kind=info&site=${s.id}`))}>拠点情報の変更で申請 ›</Lnk>
          : s.pend || s.pinfo ? '承認待ちの申請があるため、承認後に申請できます。' : ''}
      </span>
    );
  };
  function save() {
    if (!ked) return;
    const now = ked.memo !== ki.memo ? [{ label: '配送備考', from: ki.memo, to: ked.memo }] : [];
    if (!now.length) { setKed(null); toast('保存しました'); return; }
    setModal({ type: 'save', m: { scope: 'only', who: '', now } });
  }
  async function doSave(m: Save) {
    if (!m.who) { setModal({ type: 'save', m: { ...m, whoErr: true } }); return; }
    try {
      await api.action('saveKid', { acct, id: s.id, kid: k!.id, memo: ked!.memo, scope: m.scope, who: m.who });
      setModal(null); setKed(null); toast('保存しました');
    } catch (x) { toastError(x); }
  }

  return (
    <>
      <PageHead crumbs={[['拠点管理', () => leave(() => router.push('/corp/sites'))], ['拠点詳細 ' + s.id, backDetail], ked ? 'ご契約内容の編集' : 'ご契約内容']}
        title={<>{ked ? 'ご契約内容の編集 ' : 'ご契約内容 '}<span className="es-mono">{k.id}</span></>}
        stat={<><span>{s.name + ' ・ ' + cycLabel}</span><span className="k">契約</span><Badge tone={TONE_CT[s.ct.status]}>{ctSt(s.ct.status)}</Badge></>}
        actions={ked
          ? <><Button variant="outline" onClick={() => leave(() => setKed(null))}>キャンセル</Button><Button onClick={save}>保存</Button></>
          : <><Button variant="outline" onClick={backDetail}>拠点詳細へ戻る</Button>{editable ? <Button icon="PencilSimple" onClick={() => setKed({ memo: ki.memo })}>編集</Button> : null}</>} />
      {!editable && !ked ? <InlineMessage tone="info" title="このご利用月のご契約は変えられません">ご注文・変更の締切を過ぎたご利用月・過去のご利用月は参照だけです。変えられるのは {EARLIEST}（締切 {EARLIEST_DUE}）以降です。</InlineMessage> : null}
      {ked ? <InlineMessage tone="info" title="編集しています">配送備考は保存するとすぐ反映します。保存するときに「このご利用月だけ／これ以降すべて」を選びます。お届けできない曜日と設備の希望日（回収・搬入・設置）は「拠点情報の変更」で申請してください（ESキッチンの承認後に反映）。プラン・コース・配送区分・お届け回数は「変更を申請」から。</InlineMessage> : null}
      <Card className="cb-tabcard"><Tabs items={[{ value: 'ct', label: '契約' }, { value: 'eq', label: '設備・オプション' }]} value={ktab} onChange={setKtab} /></Card>
      {ktab === 'eq' ? (
        <div className="cb-stack">
          <CardT title="設備の構成（参照）">
            <Tbl cols={['設備区分', '機種', { label: '台数', cls: 'r' }, '貸出状態']}>
              {s.loans.filter((r) => r[10] !== '回収済').map((r, i) => <tr key={i}><Td v={String(r[1])} /><Td v={<Mc n={String(r[2])} />} /><Td v={String(r[4])} cls="r es-num" /><td><Badge tone={TONE_LOAN[String(r[10])]}>{r[10]}</Badge></td></tr>)}
            </Tbl>
            <div className="es-formgrid" style={{ marginTop: '0.857143rem' }}>
              <RoText label="設備の料金（参照）" cls="es-span-3">{vm ? '自販機・資材ボックスはプランに含む（0円。ESライト（自販機）の標準の設備）' : std ? '冷蔵庫・冷凍庫・資材ボックスはプランに含む（0円）' : '冷蔵庫・資材ボックスはプランに含む（0円）'}</RoText>
            </div>
          </CardT>
          <CardT title="設備の異動（この月ごとのご契約で登録）">
            <Tbl cols={['異動区分', '対象の貸出ID', '設備区分', '機種', '個体番号', { label: '数量', cls: 'r' }, '予定日', '実施日', '理由', '備考']}>
              {moves.length ? moves.map((r, i) => <tr key={i}><Td v={r[0]} /><Td v={r[1]} cls="es-mono" /><Td v={r[2]} /><Td v={<Mc n={r[3]} />} /><Td v={r[4]} cls="es-mono" /><Td v={r[5]} cls="r es-num" /><Td v={r[6]} cls="es-num" /><Td v={r[7]} cls="es-num" /><Td v={r[8]} /><Td v={r[9]} /></tr>)
                : <tr><td colSpan={10} className="c muted">この月ごとのご契約で登録した設備の異動はありません</td></tr>}
            </Tbl>
          </CardT>
          <CardT title="設置・回収の予定"><div className="es-formgrid">
            <div className="es-field es-span-3"><Lab label="設備の回収希望日／搬入希望日／設置予定日" ap="req" />
              <div className="es-input es-input--md es-input--readonly"><input readOnly value={ki.date || '—（このご利用月に設備の入れ替えはありません）'} /></div>{infoLink()}</div>
          </div></CardT>
          <CardT title="申込時の希望（参照）"><div className="es-formgrid">
            <Ro label="設備タイプ（申込時の希望）" v={s.kidInfo.wish} /><Ro label="希望冷蔵庫／希望資材ボックス" v={s.kidInfo.wishFridge} /><Ro label="電子レンジ／冷凍庫レンタルの希望" v={s.kidInfo.wishOther} />
          </div></CardT>
        </div>
      ) : (
        <div className="cb-stack">
          <CardT title="月ごとのご契約"><div className="es-formgrid">
            <Ro label="ご契約番号" v={k.id} /><Ro label="契約・ご利用月" v={cycLabel + (a1 ? '（' + a1 + '）' : '')} /><Ro label="契約番号" v={s.ct.no} />
            <RoText label="作成の記録" cls="es-span-2">{first ? '新規のお申し込みの承認で作成（' + s.ct.startOn + '）' : '月次の自動作成で作成（' + ym(k.cyc) + '分の4週前）'}</RoText>
            <Ro label="変更の適用範囲" v={ko ? (ko.scope === 'after' ? 'このご利用月以降すべて' : 'このご利用月だけ') + '（' + ko.at + ' の変更）' : '—（変更なし）'} />
          </div></CardT>
          <CardT title="契約" action={reqLink2('plan')}><div className="es-formgrid">
            <Ro label="プラン" v={k.plan} /><Ro label="メニュー種別（コース）" v={std ? 'ESスタンダード' : vm ? 'ESライト（自販機）' : 'ESライト'} /><Ro label="適用開始月" v={ym(k.cyc)} />
            <Ro label="適用終了月" v="—（自動更新）" />
            {/* 価格補助（企業負担額）は参照だけ（台帳 E 2026-10-05・受付簿 No.57） */}
            {k.subsidy ? <RoText label="価格補助（企業負担額・参照）" cls="es-span-3">{`1食あたり ${k.subsidy.perMeal}（税込）。月の企業負担分 ${k.subsidy.monthly}（税抜・${k.subsidy.perMeal} × 月のお届け数 ${k.subsidy.meals}食 ÷（1＋${k.subsidy.ratePct}%）・1円未満切り捨て）。プランの設定で、法人Web からは変えられません。`}</RoText> : null}
            <RoText label="プランから引き継いだ条件" cls="es-span-2">{vm ? '月のお届け数 冷蔵・常温 100食、標準のお届け回数 月2回、配送区分 ES配送便（固定）、自販機の貸出あり（冷蔵庫・冷凍庫なし）' : std ? '月のお届け数 冷蔵・常温 60食／冷凍 40食、標準のお届け回数 月2回、冷凍庫の貸出あり' : '月のお届け数 冷蔵・常温 50食、標準のお届け回数 月2回、冷凍庫の貸出なし'}</RoText>
          </div></CardT>
          <CardT title="お届けスケジュール" action={reqLink2('dlv')}>
            <div className="es-formgrid">
              <Ro label="配送区分" v={k.dlv} /><Ro label="配送番号" v={s.kidInfo.dno} /><Ro label="お届け回数（月）" v={k.n} />
              <div className="es-field es-span-2"><Lab label="お届けできない曜日" ap="req" /><div className="es-input es-input--md es-input--readonly"><input readOnly value={ki.ng.join('・') || 'なし'} /></div>{infoLink()}</div>
              <Ro label="お届けできない日になった場合" v={s.kidInfo.shift} />
              {!ked ? <Ro label="配送備考" v={ki.memo} cls="es-span-2" /> : (
                <div className={cx('es-field es-span-2', ked.memo !== ki.memo && 'cb-changed')}><Lab label="配送備考" ap="imm" />
                  <div className="es-input es-input--md"><input value={ked.memo} onChange={(e) => setKed({ memo: e.target.value })} /></div>
                  <span className="es-field__msg">受け渡し・搬入の注意など。保存するとすぐ反映します。</span></div>
              )}
            </div>
            <div style={{ marginTop: '1.142857rem' }}>
              <Tbl compact={false} cols={['配送種別', 'お届け回数', 'お届けの方法', 'お届けの曜日']}>
                {routes.map((r, i) => <tr key={i}><Td v={r[0]} /><Td v={r[1]} cls="es-num" /><Td v={r[2]} /><Td v={r[3]} /></tr>)}
              </Tbl>
            </div>
            <p className="note">お届けの曜日は、ご利用月の中の第何週の何曜日かを表します。お届けの回数・方法・曜日は「配送の変更」で申請します。</p>
          </CardT>
          <CardT title="メモ"><div className="es-formgrid"><Ro label="プラン外の備考（申込時）" v={first ? s.kidInfo.free : '—'} cls="es-span-3" /></div></CardT>
        </div>
      )}
      {modal?.type === 'discard' ? <ConfirmDiscard onCancel={() => setModal(null)} onConfirm={() => { const g = modal.go; setModal(null); setKed(null); g(); }} /> : null}
      {modal?.type === 'apply' ? <ApplyDialog site={{ id: s.id, name: s.name }} procs={data.procs} initial={modal.proc} onClose={() => setModal(null)} /> : null}
      {modal?.type === 'save' ? (() => {
        const m = modal.m, set = (x: Partial<Save>) => setModal({ type: 'save', m: { ...m, ...x } });
        return (
          <Dialog title="保存しますか？" id={k.id} width={800} onClose={() => setModal(null)}
            footer={<div style={{ display: 'flex', gap: '0.857143rem' }}><Button variant="outline" onClick={() => setModal(null)}>キャンセル</Button><Button onClick={() => doSave(m)}>保存</Button></div>}>
            <div className="cb-dlg">
              <div><b className="cb-mh">変更の適用範囲</b>
                <div className="cb-radios">
                  <Radio name="scope" label={'このご利用月（' + ym(k.cyc) + '）だけ'} checked={m.scope === 'only'} onChange={() => set({ scope: 'only' })} />
                  <Radio name="scope" label="このご利用月以降すべて（まだ作っていないご利用月も）" checked={m.scope === 'after'} onChange={() => set({ scope: 'after' })} />
                </div></div>
              <ChangeList title="すぐ反映します" items={m.now} />
              <p className="note">確定・請求済みのご利用月は変わりません。</p>
              <WhoField cands={data.who} value={m.who} err={m.whoErr} onPick={(w) => set({ who: w, whoErr: false })} />
            </div>
          </Dialog>
        );
      })() : null}
    </>
  );
}
